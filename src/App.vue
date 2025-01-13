<script lang="ts" setup>
import {xbox_avatar, xbox_online, xbox_room} from "./axios";
import {ref, reactive, onMounted} from "vue";
import {RefreshRight, Sunny, Moon} from '@element-plus/icons-vue';
import {ElLoading, ElNotification} from "element-plus";
import 'element-plus/es/components/loading/style/css'
import 'element-plus/es/components/notification/style/css'


import zhCn from 'element-plus/es/locale/lang/zh-cn';

import {isDark, toggleDark} from './dark';

let room_data = ref<any[]>([]);
let defaultAvatar: string = "Steve.webp";
let avatars = ref<Record<string, any>>({});
let dialogFormVisible = ref<boolean>(false);
let dialogData = reactive({
    room_count: 0,
    room_title: "",
    room_members: [] as any[],
});
let isNull = ref<string>("hide");
const isDisabled = ref<boolean>(false);


const getRoomData = async (): Promise<void> => {
    const loading = ElLoading.service({
        lock: true,
        text: '加载中...',
        background: 'rgba(0, 0, 0, 0.7)',
    })

    const {data} = await xbox_online()
    if (data.results.length === 0) {
        isNull.value = ""
    } else {
        isNull.value = "hide"
    }
    loading.close()
    room_data.value = data.results

}

onMounted(() => {
    getRoomData();
    metaThemeColor();
});

const getAvatar = async (xuid: string): Promise<void> => {
    try {
        const {data} = await xbox_avatar({xuid});
        avatars.value[xuid] = data.profileUsers[0].settings[0].value;
    } catch (e) {
        avatars.value[xuid] = defaultAvatar;
    }
};

const getAvatarUrl = (xuid: string): string => {
    if (!avatars.value[xuid]) {
        getAvatar(xuid);
        return defaultAvatar;
    }
    return avatars.value[xuid];
};

const gameMode = (mode: string, isHar: boolean): string => {
    switch (mode) {
        case "Survival":
            return isHar ? "极限模式" : "生存模式";
        case "Creative":
            return "创造模式";
        case "Adventure":
            return "冒险模式";
        case "Spectator":
            return "旁观模式";
        default:
            return "未知模式";
    }
};

const changeTime = (time: string | number | Date): string => {
    const date = new Date(time);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;

}

const getRoomInfo = async (uuid: string): Promise<JSON> => {
    const {data} = await xbox_room({uuid: uuid})

    dialogData.room_count = data.membersInfo.count
    dialogData.room_title = data.properties.custom.hostName
    dialogData.room_members = Object.values(data.members)

    return data
}

const roomInfo = (uuid: string): void => {
    dialogFormVisible.value = true
    getRoomInfo(uuid)
}

const dialogStyle = (): string => {
    return window.innerWidth > 600 ? '600px' : '90%'
}

const codes = {
    colors: {
        "0": "#000000",
        "1": "#0000AA",
        "2": "#00AA00",
        "3": "#00AAAA",
        "4": "#AA0000",
        "5": "#AA00AA",
        "6": "#FFAA00",
        "7": "#AAAAAA",
        "8": "#555555",
        "9": "#5555FF",
        "a": "#55FF55",
        "b": "#55FFFF",
        "c": "#FF5555",
        "d": "#FF55FF",
        "e": "#FFFF55",
        "f": "#FFFFFF",
        "g": "#DDD605",
        "h": "#E3D4D1",
        "i": "#CECACA",
        "j": "#DDD605",
        "m": "#971607",
        "n": "#B4684D",
        "p": "#DEB12D",
        "q": "#47A036",
        "s": "#21497B",
        "u": "#9A5CC6",
        "v": "#EB7114",
    },
    formats: {
        "l": "font-weight:bold;",   // 粗体
        "o": "font-style:italic;",  // 斜体
        "n": "text-decoration:underline;",  // 下划线
        "r": "",
    }
} as const;

const parseMinecraftColors = (text: string): string => {
    let isRandom = false;

    return text.replace(/§([0-9a-z])|([\ue100-\ue114])/g, (match, code, unicodeChar) => {
        if (code) {
            if (code === 'k') {
                isRandom = true;
                return '<span class="random-text">';
            }
            if (code === 'r') {
                isRandom = false;
                return '</span>'.repeat(text.match(/§[0-9a-fklorn]/g)?.length || 0);
            }
            const colorStyle = codes.colors[code as keyof typeof codes.colors]
                ? `color:${codes.colors[code as keyof typeof codes.colors]};`
                : "";
            const formatStyle = codes.formats[code as keyof typeof codes.formats] || "";
            return `<span style="${colorStyle}${formatStyle}">`;
        } else if (unicodeChar) {
            const spriteIndex = unicodeChar.codePointAt(0)! - 0xe100;
            const backgroundStyle = `background: url('/glyph_E1.png') no-repeat -${spriteIndex * 16}px 0px; background-size:256px 256px; width: 1em; height: 1em; display: inline-block;`;
            return `<span style="${backgroundStyle}"></span>`;
        }
        return match; // Default fallback
    }).replace(/<\/span>/g, () => isRandom ? `</span><span></span>` : "</span>");
};


const handleClick = (): void => {
    if (isDisabled.value) return;
    ElNotification({
        title: '刷新成功！',
        message: '请勿多次点击！',
        type: 'success',
        zIndex: 9999
    });
    getRoomData();
    isDisabled.value = true;

    setTimeout(() => {
        isDisabled.value = false;
    }, 5000);
};

const toggleDarkMode = (): void => {
    toggleDark();
    metaThemeColor();
};


const metaThemeColor = (): void => {
    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (metaThemeColor) {
        metaThemeColor.setAttribute('content', isDark.value ? '#121212' : '#FFFFFF');
    }
};
</script>

<template>
    <div class="common-layout">
        <el-container>
            <el-header>
                <h2 class="title">Minecraft在线房间查看</h2>
            </el-header>
            <el-main>

                <!--                <el-result :class="isNull" icon="info" title="空数据">-->
                <!--                    <template #sub-title>-->
                <!--                        <p>没有好友在玩Minecraft</p>-->
                <!--                    </template>-->
                <!--                    <template #extra>-->
                <!--                        <el-button type="primary" @click="reload()">刷新</el-button>-->
                <!--                    </template>-->
                <!--                </el-result>-->
                <el-scrollbar height="80vh">
                    <el-empty :class="isNull">
                        <template #description>
                            <p>
                                没有好友在玩Minecraft
                            </p>
                            <p>
                                快来添加我为好友吧！
                            </p>
                        </template>
                    </el-empty>

                    <div class="card-container">


                        <el-card v-for="d in room_data" :key="d.customProperties.ownerId" class="centered-card">
                            <template #header>
                                <div class="card-header">

                                    <span class="gamerName"><el-image :src="getAvatarUrl(d.customProperties.ownerId)"
                                                                      class="gamerAvatar"
                                                                      style="width: 20px; height: 20px"/>{{
                                            d.customProperties.hostName
                                        }}</span>
                                    <span class="header-right"><el-tag type="primary">{{
                                            d.customProperties.ownerId
                                        }}</el-tag></span>
                                </div>
                            </template>
                            <template #default>
                                <!--                                <p>地图名称：{{ d.customProperties.worldName }}</p>-->
                                <p v-html="'地图名称：' + parseMinecraftColors(d.customProperties.worldName)"></p>
                                <p>游戏模式：{{
                                        gameMode(d.customProperties.worldType, d.customProperties.isHardcore)
                                    }}</p>
                                <p>
                                    房间人数：{{ d.customProperties.MemberCount }}/{{
                                        d.customProperties.MaxMemberCount
                                    }}</p>
                                <p>开放时间：{{ changeTime(d.relatedInfo.postedTime) }}</p>
                            </template>
                            <template #footer>
                                <el-tag type="primary">{{ d.customProperties.version }}</el-tag>
                                <el-button class="check-btn" size="small" type="primary"
                                           @click="roomInfo(d.sessionRef.name)">
                                    查看详情
                                </el-button>

                            </template>
                        </el-card>
                    </div>
                </el-scrollbar>

            </el-main>
            <el-footer>
                <div class="footer">
                    <p>
                        Xbox：
                        <el-link href="https://www.xbox.com/zh-CN/play/user/zihaoil"
                                 type="primary">zihaoil
                        </el-link>

                    </p>
                    <p>
                        欢迎：
                        <el-link href="https://bbk.endyun.ltd/realms/" type="primary">加入基岩版领域</el-link>
                    </p>
                </div>
            </el-footer>
        </el-container>


    </div>
    <el-affix :offset="20" class="color-right-bottom" position="bottom">
        <el-button circle size="large" type="primary" @click="toggleDarkMode()">
            <el-icon style="cursor: pointer;">
                <template v-if="isDark">
                    <sunny/>
                </template>
                <template v-else>
                    <moon/>
                </template>
            </el-icon>
        </el-button>

    </el-affix>

    <el-affix :offset="20" class="affix-right-bottom" position="bottom">
        <el-button :disabled="isDisabled" :icon="RefreshRight" circle size="large" type="primary"
                   @click="handleClick()"/>
    </el-affix>
    <el-config-provider :locale="zhCn">
        <el-dialog v-model="dialogFormVisible" :title="dialogData.room_title + ' 的房间'" :width="dialogStyle()"
                   height="300">
            <el-table :data="dialogData.room_members" border resizable stripe style="width: 100%;">
                <el-table-column align="center" header-align="center" label="头像">
                    <template #default="scope">
                        <el-image :src="getAvatarUrl(scope.row.constants.system.xuid)"
                                  style="width: 25px; height: 25px"/>
                    </template>
                </el-table-column>
                <el-table-column align="center" header-align="center" label="玩家昵称" prop="gamertag" sortable>
                    <template #default="scope">
                        <span>{{ scope.row.gamertag }}</span>
                    </template>
                </el-table-column>

                <el-table-column align="center" header-align="center" label="加入时间" prop="joinTime" sortable>
                    <template #default="scope">
                        <span>{{ changeTime(scope.row.joinTime) }}</span>
                    </template>
                </el-table-column>
            </el-table>

            <template #footer>
                <div class="dialog-footer">
                    <el-tag type="primary">共{{ dialogData.room_count }}人</el-tag>
                </div>
            </template>
        </el-dialog>
    </el-config-provider>


</template>

<style scoped>

.card-container {
    display: flex;
    align-items: center;
    flex-direction: column;
    width: 100%;
    gap: 16px;
}

.centered-card {
    box-sizing: border-box;
    width: 100%;
    max-width: 700px;
    margin-bottom: 10px;
    padding: 10px;
}

.card-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;
}

.header-right {
    margin-left: auto;
}

@media (max-width: 600px) {
    .card-header {
        align-items: flex-start;
        flex-direction: column;
    }

    .header-right {
        display: block;
        width: 100%;
        margin-top: 0.25em;
        margin-left: 0;
    }

    .centered-card {
        max-width: 90%;
    }
}

.gamerName {
    font-size: 20px;
    font-weight: bold;
}

.gamerAvatar {
    margin-right: 0.25em;

}


.header-right {
    float: right;
}

.check-btn {
    float: right;
}

.title {
    margin-top: 30px;
    text-align: center;
}

.footer {
    text-align: center;
}

.hide {
    display: none;
}

.affix-right-bottom {
    position: fixed;
    z-index: 999;
    right: 20px;
}

.color-right-bottom {
    position: fixed;
    z-index: 999;
    right: 20px;
    bottom: 80px;
}

</style>
