import {useConversation} from "../context/ConversationContext.tsx";
import {useEffect, useState} from "react";
import {conversation} from "../data/savedConverstaion.ts";
import {ConversationItem} from "../types.ts";

export const useMeetingDemo = (props: {
    initial: {
        shouldStart: boolean,
        isEnded: boolean;
    }
}) => {
    const {
        participants,
        setActiveSpeaker,
    } = useConversation();

    const human = participants.find((participant) => participant.type === 'human');

    const [currentConversationItemIndex, setCurrentConversationItemIndex] = useState(0);
    const [currentSTT, setCurrentSTT] = useState<string>('');
    const [isPlaying, setIsPlaying] = useState(false);
    const [isEnded, setIsEnded] = useState(props.initial.isEnded);

    const readNextMessage = (i: number, speakCallback: (item: ConversationItem) => void) => {
        if (i < conversation.length) {
            const item = conversation[i];
            speakCallback(item);
        }
    }

    const onEnd = () => {
        if (human) {
            setActiveSpeaker(human);
            setIsPlaying(false);
        }

        setCurrentSTT('');
        setCurrentConversationItemIndex((index) => index + 1);
    }

    const onBoundary = (event: SpeechSynthesisEvent) => {
        const text = event.utterance.text;
        const currentText = text.slice(0, event.charIndex + event.charLength);
        setCurrentSTT(currentText);
    }

    useEffect(() => {
        if (!props.initial.shouldStart) {
            return;
        }

        if (isPlaying && currentConversationItemIndex > -1 && currentConversationItemIndex < conversation.length) {
            const item = conversation[currentConversationItemIndex];
            const currentUser = participants.find((participant) => participant.id === item.from);

            if (currentUser?.id === 'human') {
                setIsPlaying(false);
                return;
            }

            setActiveSpeaker(currentUser || null);
            setCurrentSTT('[ Some transcription issue 😖 ]')

            const speakCallback = async (item: ConversationItem) => {
                if (!currentUser?.speak) {
                    console.error(`Current user can't speak`)
                    return;
                }

                await currentUser.speak(item.message);
                onEnd();
            }

            readNextMessage(currentConversationItemIndex, speakCallback);
        } else if (currentConversationItemIndex === conversation.length) {
            setIsPlaying(false);
            setIsEnded(true);
        }
    }, [currentConversationItemIndex, isPlaying, props.initial.shouldStart]);

    if (!human) {
        console.error('Human not found')
    }

    return {
        currentSTT,
        isPlaying,
        setIsPlaying,
        isEnded,
        setIsEnded,
        continueDemo: () => setCurrentConversationItemIndex((index) => index + 1),
    }
}
