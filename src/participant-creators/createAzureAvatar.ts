declare global {
    interface Window {
        SpeechSDK: {
            SpeechConfig: {
                fromSubscription: (subscriptionKey: string, region: string) => unknown;
            };
            ResultReason: {
                SynthesizingAudioCompleted: string;
                Canceled: string;
            };
            CancellationReason: {
                Error: string;
            };
            CancellationDetails: {
                fromResult: (result: unknown) => {
                    reason: string;
                    errorDetails: string;
                };
            };
            AvatarSynthesizer: {
                avatarEventReceived: (s: unknown, e: { description: string }) => void;
                startAvatarAsync: (peerConnection: RTCPeerConnection) => Promise<unknown>,
                close: () => void,
                speakSsmlAsync: (ssml: string) => Promise<{
                    reason: string,
                    resultId: string
                }>,
                stopSpeakingAsync: () => Promise<unknown>,
            };
            AvatarConfig: {
                new: (talkingAvatarCharacter: string, talkingAvatarStyle: string, videoFormat: unknown) => unknown;
            };
            AvatarVideoFormat: {
                new: () => unknown;
            };
            Coordinate: {
                new: (x: number, y: number) => unknown;
            };
        }
    }
}

export const createAzureAvatar = (props: {
    id: string,
    callbacks?: {
        onConnected?: () => void,
        onDisconnected?: () => void,
        onAvatarStart?: () => void,
        onAvatarFailure?: () => void,
    },
    azureAPIConfig: {
        speechRegion: string,
        speechSubscriptionKey: string,
        speechEnablePrivateEndpoint?: boolean,
        speechPrivateEndpoint?: string,
    },
    azureConfig: {
        personalVoiceSpeakerProfileID?: string;
        customizedAvatar?: boolean,
        ttsVoice: string,
        talkingAvatarCharacter: string,
        talkingAvatarStyle: string,
        backgroundColor: string,
        transparentBackground: boolean,
        videoCrop: boolean,
    },
}) => {
    const videoId = `video-${props.id}`;
    const videoWrapper = (document.querySelector(videoId) || document.createElement('div')) as HTMLDivElement;
    videoWrapper.id = videoId;
    videoWrapper.style.display = 'none';
    document.body.appendChild(videoWrapper);

    let avatarSynthesizer: typeof window.SpeechSDK.AvatarSynthesizer;
    let peerConnection: RTCPeerConnection;

    const handleTrack = (event: RTCTrackEvent): void => {
        // Clean up existing video element if there is any
        for (let i = 0; i < videoWrapper.childNodes.length; i++) {
            if ((videoWrapper.childNodes[i] as HTMLElement).localName === event.track.kind) {
                videoWrapper.removeChild(videoWrapper.childNodes[i]);
            }
        }

        const mediaPlayer = document.createElement(event.track.kind) as HTMLMediaElement;
        mediaPlayer.id = videoId + '-video'
        mediaPlayer.srcObject = event.streams[0];
        mediaPlayer.autoplay = true;
        videoWrapper.appendChild(mediaPlayer);

        if (event.track.kind === 'video') {
            // @ts-expect-error Property 'playsInline' does not exist on type 'HTMLMediaElement'
            mediaPlayer.playsInline = true;

        } else {
            // Mute the audio player to make sure it can auto play, will unmute it when speaking
            mediaPlayer.muted = false;

            if (event.track.kind === 'audio') {
                mediaPlayer.onplaying = () => {
                    console.log(`WebRTC ${event.track.kind} channel connected.`)
                }
            }
        }
    }

    function startAvatar(
        peerConnection: RTCPeerConnection,
    ): void {
        avatarSynthesizer.startAvatarAsync(peerConnection).then((r: any) => { // Replace 'any' with the actual result type
            if (r.reason === window.SpeechSDK.ResultReason.SynthesizingAudioCompleted) {
                console.log(`[${new Date().toISOString()}] Avatar started. Result ID: ${r.resultId}`);
                props.callbacks?.onAvatarStart?.();
            } else {
                console.log(`[${new Date().toISOString()}] Unable to start avatar. Result ID: ${r.resultId}`);
                if (r.reason === window.SpeechSDK.ResultReason.Canceled) {
                    const cancellationDetails = window.SpeechSDK.CancellationDetails.fromResult(r);
                    if (cancellationDetails.reason === window.SpeechSDK.CancellationReason.Error) {
                        console.log(cancellationDetails.errorDetails);
                    }
                    console.log("Unable to start avatar: " + cancellationDetails.errorDetails);
                }
                props.callbacks?.onAvatarFailure?.();
            }
        }).catch((error: Error) => {
            console.log(`[${new Date().toISOString()}] Avatar failed to start. Error: ${error}`);
            props.callbacks?.onAvatarFailure?.();
        });
    }

    const setupWebRTC = async () => {
        const response = await fetch(
            props.azureAPIConfig.speechEnablePrivateEndpoint
                ? `https://${props.azureAPIConfig.speechPrivateEndpoint}/tts/cognitiveservices/avatar/relay/token/v1`
                : `https://${props.azureAPIConfig.speechRegion}.tts.speech.microsoft.com/cognitiveservices/avatar/relay/token/v1`,
            {
                headers: {
                    'Ocp-Apim-Subscription-Key': props.azureAPIConfig.speechSubscriptionKey,
                },
            }
        );

        const {Urls, Username, Password} = await response.json();

        const peerConnection = new RTCPeerConnection({
            iceServers: [{
                urls: [Urls],
                username: Username,
                credential: Password
            }]
        });

        peerConnection.ontrack = handleTrack;
        peerConnection.oniceconnectionstatechange = () => {
            console.log("WebRTC status: " + peerConnection.iceConnectionState);

            if (peerConnection.iceConnectionState === 'connected') {
                props.callbacks?.onConnected?.();
            }

            if (peerConnection.iceConnectionState === 'disconnected' || peerConnection.iceConnectionState === 'failed') {
                props.callbacks?.onDisconnected?.();
            }
        }

        peerConnection.addTransceiver('video', {direction: 'sendrecv'});
        peerConnection.addTransceiver('audio', {direction: 'sendrecv'});

        return peerConnection;
    }

    const startSession = async () => {
        const speechSynthesisConfig = window.SpeechSDK.SpeechConfig.fromSubscription(props.azureAPIConfig.speechSubscriptionKey, props.azureAPIConfig.speechRegion);
        const avatarConfig = createAvatarConfig();

        avatarSynthesizer = new window.SpeechSDK.AvatarSynthesizer(speechSynthesisConfig, avatarConfig);

        avatarSynthesizer.avatarEventReceived = (_s, e) => {
            console.log(`Event received: ${e.description}`);
        };

        try {
            peerConnection = await setupWebRTC();

            // Start avatar, establish WebRTC connection
            startAvatar(peerConnection);

            console.log('Avatar session started successfully');
        } catch (error) {
            console.log(`Failed to start avatar session: ${error}`);
        }

        return {
            videoWrapper,
            stopSession: () => {
                if (avatarSynthesizer) {
                    avatarSynthesizer.close();
                }
                if (peerConnection) {
                    peerConnection.close();
                }
            }
        };
    };

    const createAvatarConfig = () => {
        const videoFormat = new window.SpeechSDK.AvatarVideoFormat();
        const videoCropTopLeftX = props.azureConfig.videoCrop ? 600 : 0;
        const videoCropBottomRightX = props.azureConfig.videoCrop ? 1320 : 1920;
        videoFormat.setCropRange(
            new window.SpeechSDK.Coordinate(videoCropTopLeftX, 0),
            new window.SpeechSDK.Coordinate(videoCropBottomRightX, 1080)
        );

        const avatarConfig = new window.SpeechSDK.AvatarConfig(
            props.azureConfig.talkingAvatarCharacter,
            props.azureConfig.talkingAvatarStyle,
            videoFormat
        );
        avatarConfig.customized = props.azureConfig.customizedAvatar;
        avatarConfig.backgroundColor = props.azureConfig.transparentBackground ? '#00FF00FF' : props.azureConfig.backgroundColor;
        return avatarConfig;
    };

    const speak = async (text: string) => {
        if (!avatarSynthesizer) {
            console.error('Avatar synthesizer is not ready');
            return;
        }

        console.log('want to speak', text)

        const spokenSsml = `<speak version='1.0' xmlns='http://www.w3.org/2001/10/synthesis' xmlns:mstts='http://www.w3.org/2001/mstts' xml:lang='en-US'><voice name='${props.azureConfig.ttsVoice}'><mstts:ttsembedding speakerProfileId='${props.azureConfig.personalVoiceSpeakerProfileID}'><mstts:leadingsilence-exact value='0'/>${text}</mstts:ttsembedding></voice></speak>`;

        try {
            const result = await avatarSynthesizer.speakSsmlAsync(spokenSsml);
            if (result.reason === window.SpeechSDK.ResultReason.SynthesizingAudioCompleted) {
                console.log(`Speech synthesized for text [ ${text} ]. Result ID: ${result.resultId}`);
            } else {
                console.log(`Unable to speak text. Result ID: ${result.resultId}`);
            }
        } catch (error) {
            console.error(`Error occurred while speaking: ${error}`);
        } finally {
            console.log('done speaking', text)
        }
    }

    const stopSpeaking = async () => {
        if (!avatarSynthesizer) {
            console.error('Avatar synthesizer is not ready');
            return;
        }

        try {
            await avatarSynthesizer.stopSpeakingAsync();
            console.log('Stop speaking request sent.');
        } catch (error) {
            console.error(`Error occurred while stopping speaking: ${error}`);
        }
    }

    const createVideoSession = async () => {
        const result = await startSession();

        return {
            stopVideo: result.stopSession,
            videoElement: result.videoWrapper.firstChild as HTMLVideoElement,
        }
    };

    const createAudioSession = async () => {
        return {
            speak,
            stopSpeaking,
            stopAudioSession: () => {
                console.log('stop audio session');
            }
        }
    };

    return {
        createVideoSession,
        createAudioSession,
    }
}
