import {FooterToolbar} from "./FooterToolbar.tsx";
import {useConversation} from "../context/ConversationContext.tsx";
import {useEffect, useState} from "react";
import {useAzureSTT} from "./avatar/hooks/useAzureSTT.ts";

export const Footer = () => {
    const {activeSpeaker, setActiveSpeaker, getParticipant} = useConversation();
    const [hasUserGesture, setHasUserGesture] = useState(false);

    const {stopRecording, startRecording, isLoaded} = useAzureSTT({
        continuousConversation: true,
    });

    useEffect(() => {
        startRecording();
    }, []);

    const isRecoding = isLoaded && hasUserGesture;

    const onMute = () => {
        stopRecording();
    }
    const onUnmute = () => {
        setHasUserGesture(true);
        startRecording();
        setActiveSpeaker(getParticipant('human') || null);
    }

    const isMuted = activeSpeaker?.id !== 'human' || !isRecoding;

    return (
        <footer
            style={{
                backgroundColor: '#3b4043',
                color: 'white',
                padding: '20px',
                textAlign: 'center',
                fontSize: '1.2em',
                display: 'flex',
                justifyContent: 'space-between',
            }}
        >
            <p>
                MinglAI Meeting
            </p>
            <FooterToolbar
                status={isMuted ? 'Mute' : 'Unmute'}
                onMute={onMute}
                onUnmute={onUnmute}
            />
        </footer>
    );
}
