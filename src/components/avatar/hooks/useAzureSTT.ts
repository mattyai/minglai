import React, {useCallback, useEffect, useRef, useState} from "react";
import {useAzureAPIContext} from "../../../context/AzureAPIProvider.tsx";
import {useConversation} from "../../../context/ConversationContext.tsx";
import {useAvatarMessages} from "./useAvatarMessages.ts";

export const useAzureSTT = (props: {
    stopAvatarSpeaking?: () => void;
    continuousConversation: boolean;
}) => {
    const [isRecording, setIsRecording] = useState(false);
    const [waitForReady, setWaitForReady] = useState(0);
    const [isLoaded, setIsLoaded] = useState(false);
    const isLoading = useRef(false);
    const recognizerRef = useRef<never>(null);
    const {azureAPIConfig} = useAzureAPIContext();
    const {addMessage, getParticipant, setActiveSpeaker} = useConversation();

    const {messages, handleSendMessage} = useAvatarMessages({
        ...azureAPIConfig,
        onNewMessage: (from, message) => {
            const participant = getParticipant(from);

            if (participant && participant.speak) {
                setActiveSpeaker(participant);
                participant.speak(message);
            }

            console.log("new message:", message);
        }
    });


    useEffect(() => {
        if (isLoaded) {
            return;
        }

        if (isLoading.current) {
            return;
        }

        isLoading.current = true;

        if (!window.SpeechSDK || waitForReady > 5) {
            console.error('Speech SDK not loaded', waitForReady);
            setTimeout(() => {
                setWaitForReady(waitForReady + 1);
            }, 1000);

            return;
        }

        console.log('Loaded Speech SDK', waitForReady)

        const speechRecognitionConfig = window.SpeechSDK.SpeechConfig.fromEndpoint(new URL(`wss://${azureAPIConfig.speechRegion}.stt.speech.microsoft.com/speech/universal/v2`), azureAPIConfig.speechSubscriptionKey)
        speechRecognitionConfig.setProperty(window.SpeechSDK.PropertyId.SpeechServiceConnection_LanguageIdMode, "Continuous")


        const audioConfig = window.SpeechSDK.AudioConfig.fromDefaultMicrophoneInput();
        const autoDetectSourceLanguageConfig = SpeechSDK.AutoDetectSourceLanguageConfig.fromLanguages(['en-US']);
        recognizerRef.current = window.SpeechSDK.SpeechRecognizer.FromConfig(speechRecognitionConfig, autoDetectSourceLanguageConfig, audioConfig);

        setIsLoaded(true);

        recognizerRef.current.recognizing = (s, e) => {
            console.log(' recognizing', e.result.text);
            props.stopAvatarSpeaking?.();
        }

        recognizerRef.current.recognized = (s, e) => {
            console.log(' recognized', e.result.reason)
            if (e.result.reason === window.SpeechSDK.ResultReason.RecognizedSpeech) {
                const userQuery = e.result.text.trim();
                console.log('Recognized:', userQuery)
                if (userQuery !== '') {
                    addMessage({
                        from: getParticipant('human')!,
                        content: userQuery,
                        id: Date.now().toString(),
                        timestamp: new Date(),
                        type: 'meeting',
                        to: 'everyone',
                    })
                    handleSendMessage(userQuery, '');

                    if (!props.continuousConversation) {
                        stopRecording();
                    }
                }
            }
        };
    }, [addMessage, azureAPIConfig.speechRegion, azureAPIConfig.speechSubscriptionKey, getParticipant, handleSendMessage, isLoaded, props, waitForReady]);

    const startRecording = useCallback(() => {
        if (recognizerRef.current) {
            recognizerRef.current.startContinuousRecognitionAsync(
                () => {
                    setIsRecording(true);
                },
                (error) => {
                    console.error('Error starting recognition:', error);
                }
            );
        } else {
            console.error('Speech recognizer not initialized');
        }
    }, [recognizerRef.current, waitForReady]);

    const stopRecording = useCallback(() => {
        if (recognizerRef.current) {
            recognizerRef.current.stopContinuousRecognitionAsync(
                () => {
                    setIsRecording(false);
                },
                (error) => {
                    console.error('Error stopping recognition:', error);
                }
            );
        }
    }, [recognizerRef.current]);

    const toggleRecording = () => {
        if (isRecording) {
            stopRecording();
        } else {
            startRecording();
        }
    };

    return {
        isLoaded,
        startRecording,
        stopRecording,
        isRecording,
        toggleRecording
    }
}
