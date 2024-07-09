import {useConversation} from "../context/ConversationContext";
import {getFormattedNames} from "../utils/text.ts";

export const MeetingEnd = () => {
    const {participants} = useConversation();
    const guests = participants.filter((participant) => participant.id !== 'human' && participant.isVideoOn);

    return (
        <div>
            <h1>Thank you for the meeting</h1>
            <br/>
            <p>
                    <span
                        className={'waiting-room'}
                        style={{
                            display: 'flex',
                            justifyContent: 'center',

                        }}
                    >{
                        guests.map((participant) => {
                            return (
                                <img
                                    key={participant.id}
                                    src={participant.avatarUrl}
                                    alt={participant.name}
                                    style={{
                                        width: '50px',
                                        height: '50px',
                                        borderRadius: '50%',
                                        margin: '0 10px',
                                    }}
                                />
                            )
                        })
                    }
                    </span>
                {getFormattedNames(guests.map(participant => participant.name))}
            </p>
        </div>
    )
}
