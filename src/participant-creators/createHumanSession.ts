import {Participant} from "../context/ConversationContext";

export const createHumanSession = () => {
    const videoId = 'local-video';
    const video = (document.querySelector(`#${videoId}`) || document.createElement('video')) as HTMLVideoElement;
    video.style.width = '100%';
    video.style.height = '100%';
    video.style.objectFit = 'cover';
    video.id = videoId;
    video.setAttribute('playsinline', '');
    video.setAttribute('autoplay', '');
    video.volume = 0;
    video.muted = true;
    video.style.zIndex = '1000';
    video.style.display = 'none';
    document.body.appendChild(video);

    const startLocalCamera = async (_participant: Participant, callbacks: {
        onVideoOn: () => void
    }) => {
        try {
            video.srcObject = await navigator.mediaDevices.getUserMedia({video: {facingMode: 'user'}});
            video.play();

            callbacks.onVideoOn();

            return {
                videoElement: video,
                stopVideo: () => {
                    if (video) {
                        (video.srcObject as MediaStream)?.getTracks().forEach(track => {
                            track.stop();
                        });
                    }
                }
            };
        } catch (error) {
            console.error('The following error occurred: ' + error);
        }
    }

    const startLocalAudio = async () => {
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
            console.error('getUserMedia is not supported');
            return;
        }

        // @ts-expect-error - TS doesn't know about the `webkitSpeechRecognition` property
        if (!window.webkitSpeechRecognition) {
            console.error('SpeechRecognition is not supported');
            return;
        }

        try {
            // const stream = await navigator.mediaDevices.getUserMedia({audio: true});
            // // @ts-expect-error - TS doesn't know about the `webkitSpeechRecognition` property
            // const recognition = new window.webkitSpeechRecognition();
            // recognition.continuous = true;
            // recognition.interimResults = true;
            // recognition.lang = 'en-US';
            // recognition.start();
            //
            // recognition.onresult = function (event: never) {
            //     // @ts-expect-error - TS doesn't know about the `results` property
            //     const result = event.results[event.results.length - 1];
            //
            //     if (result.isFinal) {
            //         console.log(result[0]);
            //     }
            // }
            return {
                stream,
                speak: async () => {
                    // Local human should speak physically :)
                },
                stopSpeaking: () => {
                    // Local human should stop physically :)
                }
            };
        } catch (error) {
            console.error('The following error occurred: ' + error);
        }
    }

    const stopLocalAudio = () => {
        navigator.mediaDevices.getUserMedia({audio: true}).then(function (stream) {
            stream.getTracks().forEach(track => {
                track.stop();
            });
        }).catch(function (err) {
            console.error('The following error occurred: ' + err);
        });
    }

    return {
        startLocalCamera,
        startLocalAudio,
        stopLocalAudio
    }
}
