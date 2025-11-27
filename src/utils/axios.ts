import axios from 'axios'
import type {AxiosInstance} from 'axios'

const isNetlify = import.meta.env.VITE_NETLIFY == 'true'

const request: AxiosInstance = axios.create({
    baseURL: isNetlify ? '/api' : 'https://api.miaaoo.com/',
    timeout: 30000,
    headers: {
        'Content-Type': 'application/json',
    }
})

export const mc_list = (lang?: string): Promise<any> => {
    return request({
        url: '/list',
        method: 'get',
        ...(lang ? {params: {lang}} : {})
    })
}

export const mc_join = (roomFrom: string, addId: string, roomId: string, sessionName: string, userXuid: string): Promise<any> => {
    return request({
        url: '/join',
        method: 'post',
        data: {
            version: '1.0.0',
            joininformation: {
                addid: addId,
                roomfrom: roomFrom,
                roomid: roomId,
                sessionname: sessionName,
            },
            invitecontrol: {
                userxuid: userXuid,
            }
        }
    })
}

export const mc_account = (): Promise<any> => {
    return request({
        url: '/account',
        method: 'get',
    })
}

export const mc_profile = (gt: string): Promise<any> => {
    return request({
        url: '/profile',
        method: 'get',
        params: {
            gt: gt,

        }
    })
}

export const mc_roominfo = (session: string, roomFrom: string): Promise<any> => {
    return request({
        url: '/roominfo',
        method: 'get',
        params: {
            session: session,
            roomfrom: roomFrom,
        }
    })
}

// export const mc_ai = (query:any): Promise<any> => {
//     return request({
//         url: 'https://api.dify.ai/v1/chat-messages',
//         method: 'post',
//         headers: {
//             Authorization: `Bearer app-7sVC7DkpvC8hIh0o8DeyA5d6`,
//             'Content-Type': 'application/json'
//         },
//         data: {
//             inputs: {},
//             query: query,
//             response_mode: "streaming",
//             conversation_id: "",
//             user: "abc-123",
//         }
//     })
// }

export const mc_ai_sse = (query: string) => {
    const url = "https://api.dify.ai/v1/chat-messages";

    return fetch(url, {
        method: "POST",
        headers: {
            Authorization: `Bearer app-7sVC7DkpvC8hIh0o8DeyA5d6`,
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            inputs: {},
            query,
            response_mode: "streaming",
            user: "abc-123",
            files: []
        })
    });
};
