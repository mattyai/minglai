import {AvatarChat} from "./avatar/AvatarChat.tsx";
import React from "react";
import {useAvatarMessages} from "./avatar/hooks/useAvatarMessages.ts";
import {useAzureAPIContext} from "../context/AzureAPIProvider";
import {AvatarRecording} from "./avatar/AvatarRecord.tsx";
import {useConversation} from "../context/ConversationContext.tsx";

export const ChatContainer: React.FC = () => {
    const {azureAPIConfig} = useAzureAPIContext();
    const {addMessage, getParticipant, setActiveSpeaker} = useConversation();
    const [isOpen, setIsOpen] = React.useState(false);

    const {messages, handleSendMessage} = useAvatarMessages({
        ...azureAPIConfig,
        onNewMessage: (from, message) => {
            const participant = getParticipant(from);

            if (participant && participant.speak) {
                setActiveSpeaker(participant);
                participant.speak(message);
            }

            // Do something with the message
            console.log("new message:", message);
        }
    })

    if (!isOpen) {
        return (
            <div
                style={{
                    position: 'fixed',
                    top: '0',
                    left: '0',
                    width: '30px',
                    height: '30px',
                    backgroundColor: '#3b4043',
                    color: 'white',
                    padding: '20px',
                    textAlign: 'center',
                    fontSize: '1.2em',
                    display: 'flex',
                    justifyContent: 'space-between',
                }}
            >
                <button
                    onClick={() => setIsOpen(true)}
                    style={{
                        backgroundColor: 'transparent',
                        border: 'none',
                        color: 'white',
                        cursor: 'pointer',
                    }}
                >
                    Open chat
                </button>
            </div>
        )
    }

    return (
        <aside
            style={{
                position: 'fixed',
                top: '0',
                left: '0',
                width: '30px',
                height: '90%',

                backgroundColor: '#3b4043',
                color: 'white',
                padding: '20px',
                textAlign: 'center',
                fontSize: '1.2em',
                display: 'flex',
                justifyContent: 'space-between',
            }}
        >
            <button
                onClick={() => setIsOpen(false)}
                style={{
                    backgroundColor: 'transparent',
                    border: 'none',
                    color: 'white',
                    cursor: 'pointer',
                }}
            >
                Close chat
            </button>
            <div className="w-1/2 pl-2">
                <AvatarRecording
                    continuousConversation={true}
                    onRecognizedSpeech={(userQuery: string) => {
                        addMessage({
                            from: getParticipant('human')!,
                            content: userQuery,
                            id: Date.now().toString(),
                            timestamp: new Date(),
                            type: 'meeting',
                            to: 'everyone',

                        })
                        handleSendMessage(userQuery, '')
                    }}
                />

                <AvatarChat
                    messages={messages}
                    onSendMessage={handleSendMessage}
                    isSpeaking={false}
                    sessionActive={true}
                />
            </div>
        </aside>
    )
}
