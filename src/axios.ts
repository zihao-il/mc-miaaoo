import axios from 'axios'
import type {AxiosInstance} from 'axios'

const request: AxiosInstance = axios.create({
    baseURL: 'https://mc.miaaoo.com:10100/',
    timeout: 30000,
    headers: {
        'Content-Type': 'application/json',
    }
})


export const mc_list = (id: string): Promise<any> => {
    return request({
        url: '/list',
        method: 'post',
        params: {
            id: id
        }
    })
}

export const mc_join = (listId: number,roomId: string, sessionName: string): Promise<any> => {
    return request({
        url: '/join',
        method: 'post',
        params: {
            listid: listId,
            roomid : roomId,
            sessionname: sessionName
        }
    })
}
