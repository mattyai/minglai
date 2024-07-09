import React, {createContext, useContext, useState} from 'react';
import {AvatarProps} from "../components/avatar/types/avatar.ts";

export type Participant = {
    id: string;
    name: string;
    role: string;
    roomRole: 'host' | 'co-host' | 'participant';
    isVideoOn?: boolean;
    isAudioOn?: boolean;
    isScreenSharing?: boolean;
    isHandRaised?: boolean;
    avatarUrl?: string;
    backgroundUrl?: string,
    hasTransparentBackground?: boolean;
    isLoaded?: boolean;
    videoElement?: HTMLVideoElement | undefined;
    createVideoSession: (participant: Participant, callback: {
        onVideoOn: () => void
    }) => Promise<{
        videoElement: HTMLVideoElement | undefined;
        stopVideo: () => void;
    } | undefined>;
    createAudioSession: (participant: Participant) => Promise<{
        speak: (text: string) => Promise<void>;
        stopSpeaking: () => void;
    } | undefined>;
    stopVideoSession?: (participant: Participant) => void;
    stopAudioSession?: (participant: Participant) => void;
    type: 'azure-avatar' | 'human' | 'local-avatar';
    azureConfig?: AvatarProps;
    localConfig?: {
        voice: number;
    };
    speak?: (text: string) => Promise<void>;
    stopSpeaking?: () => void;
};

export type Message = {
    id: string;
    from: Participant;
    to: 'everyone' | Participant;
    content: string;
    timestamp: Date;
    type: 'chat' | 'system' | 'private' | 'meeting';
};

export type Reaction = {
    id: string;
    from: Participant;
    type: '👍' | '👏' | '❤️' | '😂' | '😮' | '🎉';
    timestamp: Date;
};

export type MeetingStatus = 'not-started' | 'in-progress' | 'ended';

export type ConversationContextType = {
    participants: Participant[];
    messages: Message[];
    reactions: Reaction[];
    meetingStatus: MeetingStatus;
    activeScreenShare: Participant | null;
    activeSpeaker: Participant | null;
    isMeetingRecording: boolean;
    waitingRoomEnabled: boolean;
    waitingRoomParticipants: Participant[];
    addParticipant: (participant: Participant) => Participant;
    removeParticipant: (participantId: string) => void;
    updateParticipant: (participantId: string, updates: Partial<Participant>) => void;
    getParticipant: (participantId: string) => Participant | undefined;
    addMessage: (message: Message) => void;
    addReaction: (reaction: Reaction) => void;
    setMeetingStatus: (status: MeetingStatus) => void;
    setActiveScreenShare: (participant: Participant | null) => void;
    setActiveSpeaker: (participant: Participant | null) => void;
    toggleParticipantVideo: (participantId: string) => void;
    toggleParticipantAudio: (participantId: string) => void;
    toggleParticipantHand: (participantId: string) => void;
    startScreenShare: (participantId: string) => void;
    stopScreenShare: (participantId: string) => void;
    toggleMeetingRecording: () => void;
    toggleWaitingRoom: () => void;
    admitFromWaitingRoom: (participantId: string) => void;
};

const ConversationContext = createContext<ConversationContextType | undefined>(undefined);

export const ConversationProvider: React.FC<{ children: React.ReactNode }> = ({children}) => {
    const [participants, setParticipants] = useState<Participant[]>([]);
    const [messages, setMessages] = useState<Message[]>([]);
    const [reactions, setReactions] = useState<Reaction[]>([]);
    const [meetingStatus, setMeetingStatus] = useState<MeetingStatus>('not-started');
    const [activeScreenShare, setActiveScreenShare] = useState<Participant | null>(null);
    const [activeSpeaker, setActiveSpeaker] = useState<Participant | null>(null);
    const [isMeetingRecording, setIsMeetingRecording] = useState<boolean>(false);
    const [waitingRoomEnabled, setWaitingRoomEnabled] = useState<boolean>(false);
    const [waitingRoomParticipants, setWaitingRoomParticipants] = useState<Participant[]>([]);

    const addParticipant = (participant: Participant) => {
        const existingParticipant = participants.find((p) => p.id === participant.id);
        if (existingParticipant) {
            return existingParticipant;
        }

        participant.createVideoSession(participant, {
            onVideoOn: () => {
                participant.isVideoOn = true;
                updateParticipant(participant.id, participant);
            }
        })
            .then((result) => {
                if (result) {
                    participant.videoElement = result.videoElement;
                    participant.stopVideoSession = result.stopVideo;
                }
            })
            .catch((error) => {
                console.log(`Can't start video for ${participant.id}`, error)
            })
            .finally(() => {
                updateParticipant(participant.id, participant);
            });

        participant.createAudioSession(participant)
            .then((result) => {
                if (result) {
                    participant.speak = result.speak;
                    participant.stopSpeaking = result.stopSpeaking;
                    participant.isAudioOn = true;
                }
            })
            .catch((error) => {
                console.log(`Can't start audio for ${participant.id}`, error)
            })
            .finally(() => {
                updateParticipant(participant.id, participant);
            });

        setParticipants((prevParticipants) => [...prevParticipants, participant]);

        return participant;
    };

    const removeParticipant = (participantId: string) => {
        setParticipants((prevParticipants) =>
            prevParticipants.filter((p) => p.id !== participantId)
        );
    };

    const updateParticipant = (participantId: string, updates: Partial<Participant>) => {
        setParticipants((prevParticipants) =>
            prevParticipants.map((p) =>
                p.id === participantId ? {...p, ...updates} : p
            )
        );
    };

    const getParticipant = (participantId: string) => {

        return participants.find((p) => p.id === participantId);
    }

    const addMessage = (message: Message) => {
        setMessages((prevMessages) => [...prevMessages, message]);
    };

    const addReaction = (reaction: Reaction) => {
        setReactions((prevReactions) => [...prevReactions, reaction]);
    };

    const toggleParticipantVideo = (participantId: string) => {
        updateParticipant(participantId, {
            isVideoOn: !participants.find((p) => p.id === participantId)?.isVideoOn,
        });
    };

    const toggleParticipantAudio = (participantId: string) => {
        updateParticipant(participantId, {
            isAudioOn: !participants.find((p) => p.id === participantId)?.isAudioOn,
        });
    };

    const toggleParticipantHand = (participantId: string) => {
        updateParticipant(participantId, {
            isHandRaised: !participants.find((p) => p.id === participantId)?.isHandRaised,
        });
    };

    const startScreenShare = (participantId: string) => {
        const participant = participants.find((p) => p.id === participantId);
        if (participant) {
            setActiveScreenShare(participant);
            updateParticipant(participantId, {isScreenSharing: true});
        }
    };

    const stopScreenShare = (participantId: string) => {
        setActiveScreenShare(null);
        updateParticipant(participantId, {isScreenSharing: false});
    };

    const toggleMeetingRecording = () => {
        setIsMeetingRecording((prev) => !prev);
    };

    const toggleWaitingRoom = () => {
        setWaitingRoomEnabled((prev) => !prev);
    };

    const admitFromWaitingRoom = (participantId: string) => {
        const participant = waitingRoomParticipants.find((p) => p.id === participantId);
        if (participant) {
            setWaitingRoomParticipants((prev) => prev.filter((p) => p.id !== participantId));
            addParticipant(participant);
        }
    };

    const value = {
        participants,
        messages,
        reactions,
        meetingStatus,
        activeScreenShare,
        activeSpeaker,
        isMeetingRecording,
        waitingRoomEnabled,
        waitingRoomParticipants,
        addParticipant,
        removeParticipant,
        updateParticipant,
        getParticipant,
        addMessage,
        addReaction,
        setMeetingStatus,
        setActiveScreenShare,
        setActiveSpeaker,
        toggleParticipantVideo,
        toggleParticipantAudio,
        toggleParticipantHand,
        startScreenShare,
        stopScreenShare,
        toggleMeetingRecording,
        toggleWaitingRoom,
        admitFromWaitingRoom,
    };

    return (
        <ConversationContext.Provider value={value}>
            {children}
        </ConversationContext.Provider>
    );
};

export const useConversation = () => {
    const context = useContext(ConversationContext);
    if (context === undefined) {
        throw new Error('useConversation must be used within a ConversationProvider');
    }
    return context;
};
