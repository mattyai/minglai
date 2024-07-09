import {Participant} from "../context/ConversationContext";

type LocalAvatarProps = {
    imageUrl: string,
    voice: number,
    onBoundary?: (event: SpeechSynthesisEvent) => void
}

export const createLocalAvatar = (props: LocalAvatarProps) => {
    window.speechSynthesis.getVoices();

    const startLocalCamera = async (_participant: Participant, callbacks: {
        onVideoOn: () => void
    }) => {
        try {
            callbacks.onVideoOn();

            return {
                videoElement: undefined,
                stopVideo: () => {
                }
            };
        } catch (error) {
            console.error('The following error occurred: ' + error);
        }
    }

    const startLocalAudio = async () => {
        return {
            speak: async (text: string) => {
                return new Promise<void>((resolve) => {
                    const utterance = new SpeechSynthesisUtterance(text);
                    const voices = window.speechSynthesis.getVoices();
                    utterance.voice = voices[props.voice];
                    utterance.text = text;
                    // utterance.lang = args.voice === 6 ? 'en-GB' : 'en-US';
                    const onBoundary = props.onBoundary || (() => {
                    });
                    utterance.addEventListener('boundary', onBoundary);
                    utterance.addEventListener('end', () => {
                        resolve();
                    });

                    speechSynthesis.speak(utterance);
                })
            },
            stopSpeaking: () => {
                speechSynthesis.cancel();
            }
        };
    };

    const stopLocalAudio = () => {
        speechSynthesis.cancel();
    }

    return {
        startLocalCamera,
        startLocalAudio,
        stopLocalAudio
    }
}
