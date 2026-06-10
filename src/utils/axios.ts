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
        url: '/v2/list',
        method: 'get',
        ...(lang ? {params: {lang}} : {})
    })
}

export const mc_join = (roomFrom: string, addId: string, handleId: string, sessionName: string, userXuid: string): Promise<any> => {
    return request({
        url: '/v2/join',
        method: 'post',
        data: {
            apiversion: 2,
            joininformation: {
                addid: addId,
                roomfrom: roomFrom,
                handleid: handleId,
                sessionname: sessionName,
                userxuid: userXuid,
            },
        }
    })
}

export const mc_account = (): Promise<any> => {
    return request({
        url: '/v2/account',
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

export const mc_refresh_followers = (): Promise<any> => {
    return request({
        url: '/refreshFollowers',
        method: 'get',
    })
}
