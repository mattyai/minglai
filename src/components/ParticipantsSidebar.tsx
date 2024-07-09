import {MeetingParticipant} from "./MeetingParticipant.tsx";
import {useConversation} from "../context/ConversationContext.tsx";

export const ParticipantsSidebar = () => {
    const {participants, activeSpeaker, setActiveSpeaker} = useConversation();

    return (
        <div
            className={'meeting-users'}
        >
            {participants.map((participant) => (
                <MeetingParticipant
                    onClick={() => setActiveSpeaker(participant)}
                    participant={participant}
                    key={participant.id}
                    isActive={activeSpeaker?.id === participant.id}
                />
            ))}
        </div>
    )
}
