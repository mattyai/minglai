export interface AvatarProps {
    ttsVoice: string;
    customVoiceEndpointId?: string;
    personalVoiceSpeakerProfileID?: string;
    talkingAvatarCharacter: string;
    talkingAvatarStyle: string;
    backgroundColor: string;
    customizedAvatar?: boolean;
    transparentBackground: boolean;
    videoCrop: boolean;
    localIdleVideo?: string;
}

export interface Message {
    role: 'user' | 'assistant' | 'system' | 'tool';
    content: string | { type: 'text' | 'image_url'; text?: string; image_url?: { url: string } }[];
    name?: string;
    tool_call_id?: string;
    tool_calls?: [
        {
            type: 'function';
            id: string;
            function: {
                name: string;
                arguments: string
            }
        }
    ]
}
