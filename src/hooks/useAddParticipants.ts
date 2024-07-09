import {useAzureAPIContext} from "../context/AzureAPIProvider";
import {useEffect, useRef} from "react";
import {Participant, useConversation} from "../context/ConversationContext.tsx";
import Lisa from "../assets/lisa.png";
import Max from "../assets/max.png";
import Donna from "../assets/donna.jpg";
import {createHumanSession} from "../participant-creators/createHumanSession.ts";
import {createLocalAvatar} from "../participant-creators/createLocalAvatar.ts";
import {createAzureAvatar} from "../participant-creators/createAzureAvatar.ts";

type AiParticipant =
    Pick<Participant, 'id' | 'role' | 'name' | 'avatarUrl' | 'backgroundUrl' | 'roomRole' | 'type' | 'hasTransparentBackground'>
    & {
    azureConfig: {
        ttsVoice: string,
        talkingAvatarCharacter: string,
        talkingAvatarStyle: string,
        backgroundColor: string,
        videoCrop: boolean,
        transparentBackground: boolean,
    }
}

const AiParticipants: AiParticipant[] = [
    {
        id: 'yael',
        role: 'Data Scientist',
        name: 'Yael',
        avatarUrl: Lisa,
        backgroundUrl: '',
        roomRole: 'participant',
        type: 'azure-avatar',
        hasTransparentBackground: true,
        azureConfig: {
            ttsVoice: "en-US-JennyNeural",
            talkingAvatarCharacter: "lisa",
            talkingAvatarStyle: "casual-sitting",
            backgroundColor: "#00FF00FF",
            transparentBackground: true,
            videoCrop: true,
        }
    },
    {
        id: 'ahmad',
        role: 'Account Manager',
        name: 'Ahmad',
        avatarUrl: Max,
        backgroundUrl: '',
        roomRole: 'participant',
        type: 'azure-avatar',
        hasTransparentBackground: true,
        azureConfig: {
            ttsVoice: "en-US-GuyNeural",
            talkingAvatarCharacter: "max",
            talkingAvatarStyle: "business",
            backgroundColor: "#00FF00FF",
            transparentBackground: true,
            videoCrop: true,
        },
    },
];

export const useAddParticipants = () => {
    const {azureAPIConfig} = useAzureAPIContext();
    const {participants, addParticipant, setActiveSpeaker, updateParticipant} = useConversation();
    const {startLocalCamera, startLocalAudio} = createHumanSession();
    const {
        startLocalCamera: startLocalAvatarCamera,
        startLocalAudio: startLocalAvatarAudio,
    } = createLocalAvatar({
        imageUrl: '',
        voice: 6,
    });

    const isLoaded = useRef(false);

    useEffect(() => {
        if (isLoaded.current) {
            return;
        }

        isLoaded.current = true;

        const human = addParticipant({
            id: 'human',
            role: '',
            name: 'You',
            avatarUrl: '',
            roomRole: 'host',
            type: 'human',
            createVideoSession: startLocalCamera,
            createAudioSession: startLocalAudio,
        });

        addParticipant({
            id: 'david',
            role: 'Business Analyst',
            name: 'David',
            avatarUrl: Donna,
            roomRole: 'participant',
            type: 'local-avatar',
            createVideoSession: startLocalAvatarCamera,
            createAudioSession: startLocalAvatarAudio,
        });

        setActiveSpeaker(human);

        AiParticipants.forEach(async (AiParticipant) => {
            const participant = addParticipant({
                ...AiParticipant,
                ...createAzureAvatar({
                    id: AiParticipant.id,
                    azureConfig: AiParticipant.azureConfig,
                    azureAPIConfig,
                    callbacks: {
                        onConnected: () => {
                            participant.isVideoOn = true;
                            participant.isAudioOn = true;
                            updateParticipant(participant.id, participant);
                        }
                    }
                })
            });
        });

        isLoaded.current = true;

        return () => {
            participants.forEach((participant) => {
                participant.stopVideoSession?.(participant);
                participant.stopAudioSession?.(participant);
            });
        }
    }, []);

    return {
        isLoaded: isLoaded.current,
    }
}
