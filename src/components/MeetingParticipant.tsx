import {SelfVideo} from "./SelfVideo.tsx";
import {Participant} from "../context/ConversationContext.tsx";

export const MeetingParticipant = (props: {
    participant: Participant;
    onClick?: () => void;
    isActive?: boolean;
}) => {
    if (!props.participant.isVideoOn) {
        return null;
    }

    return (
        <div
            onClick={props.onClick}
            className={props.isActive ? 'active' : ''}
            style={{}}
        >
            {props.participant.id === 'human' && <div
              style={{
                  width: '80px',
                  objectFit: 'cover',
                  zIndex: '1000',
                  borderRadius: '50%',
                  minHeight: '80px',
              }}
            ><SelfVideo

              isStopped={props.isActive}
              style={{
                  borderRadius: '50%',
              }}
            />
            </div>
            }

            {(props.participant.id !== 'human') && <div
              style={{
                  borderRadius: '50%',
                  width: '80px',
                  height: '80px',
                  backgroundSize: 'cover',
                  border: props.isActive ? '2px solid #333' : 'none',
                  backgroundImage: 'url(' + props.participant.avatarUrl + ')',
                  backgroundPosition: 'top',
                  backgroundColor: 'white',
              }}
            />
            }

            <p
                style={{
                    color: 'white',
                    fontSize: '1em',
                }}
            >{props.participant.name} {props.participant.role ? ' - ' + props.participant.role : ''}</p>
        </div>
    )
}
