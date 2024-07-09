import {useConversation} from "../context/ConversationContext.tsx";
import {AvatarVideo} from "./avatar/AvatarVideo.tsx";

export const ActiveSpeaker = () => {
    const {activeSpeaker, messages} = useConversation();

    return (
        <div
            className={'active-speaker'}
            style={{
                display: 'flex',
                width: '850px',
                marginInline: '20px',
                flexDirection: 'column',
            }}
        >
            {activeSpeaker && <div
              style={{
                  backgroundColor: '#3b4043',
                  borderRadius: '10px',
                  padding: '20px',
                  height: '500px',
              }}
            >
              <div>
                <AvatarVideo participant={activeSpeaker}/>

                <div className={'voice-container'}>
                  <div className={'voice-bar'}/>
                  <div className={'voice-bar'}/>
                  <div className={'voice-bar'}/>
                  <div className={'voice-bar'}/>
                  <div className={'voice-bar'}/>
                </div>
              </div>

              <p
                style={{
                    color: 'white',
                    fontSize: '1em',
                }}
              >{activeSpeaker.name} {activeSpeaker.role ? ' - ' + activeSpeaker.role : ''}
              </p>
            </div>
            }

            {activeSpeaker && <aside
              style={{
                  margin: '20px',
                  textAlign: 'start',
              }}
            >
                {messages
                    .filter((message) => {
                        console.log({message})

                        return message.from.id === activeSpeaker.id
                    })
                    .slice(-1)
                    .map((message) => (
                        <div key={message.id}>
                            <p>{message.content}</p>
                        </div>
                    ))
                }
            </aside>
            }
        </div>
    )
}
