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

export const mc_join = (source: number,listid: string, sessionname: string): Promise<any> => {
    return request({
        url: '/join',
        method: 'post',
        params: {
            source : source,
            listid: listid,
            sessionname: sessionname
        }
    })
}
