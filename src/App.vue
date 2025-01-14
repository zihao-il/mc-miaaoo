<script lang="ts" setup>
import {mc_list, mc_join} from "./axios";
import {ref, onMounted} from "vue";
import {RefreshRight, Sunny, Moon, Setting} from '@element-plus/icons-vue';
import {ElLoading, ElNotification} from "element-plus";
import 'element-plus/es/components/loading/style/css'
import 'element-plus/es/components/notification/style/css'


import {isDark, toggleDark} from './dark';

let room_data = ref<any[]>([]);
let isNull = ref<string>("hide");
const isDisabled = ref<boolean>(false);
let dialogFormVisible = ref<boolean>(false);
const clickedButtons = new Set<string>();
const dialogStyle = (): string => {
    return window.innerWidth > 600 ? '600px' : '90%'
}


import {useMCOnlineStore} from './store'

const store = useMCOnlineStore()

const getRoomData = async (): Promise<void> => {
    const loading = ElLoading.service({
        lock: true,
        text: '加載中...',
        background: 'rgba(0, 0, 0, 0.7)',
    })

    let sources = store.ShowRoom
    const requests = sources.filter((source) => source.id !== 0).map(async (source) => {
        const {data} = await mc_list(source.id.toString());
        return data.results.map((room: any) => ({
            ...room,
            sourceName: source.name,
            sourceId: source.id,
        }));
    });
    const results = await Promise.all(requests);
    room_data.value = results.flat();
    if (sources.find((source) => source.id === 0)) {
        room_data.value = room_data.value.filter((room: any) => {
            return !(room.customProperties.MemberCount >= room.customProperties.MaxMemberCount || room.customProperties.BroadcastSetting !== 3);
        });
    }

    isNull.value = room_data.value.length === 0 ? "" : "hide";
    loading.close()

};


onMounted(() => {
    getRoomData();
    metaThemeColor();
});

const gameMode = (mode: string, isHar: boolean): string => {
    switch (mode) {
        case "Survival":
            return isHar ? "極限模式" : "生存模式";
        case "Creative":
            return "創造模式";
        case "Adventure":
            return "冒險模式";
        case "Spectator":
            return "旁觀模式";
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

const wsJoin = async (id: string, name: string, sourceName: string, sourceId: number): Promise<void> => {
    if (clickedButtons.has(id)) return;
    clickedButtons.add(id);


    const Friends = JSON.parse(store.Friends)
    const setId = Friends.id
    const setName = Friends.name
    await mc_join(setId, id, name);
    if (setName !== sourceName) {

        await mc_join(sourceId, id, name);

    }
    ElNotification({
        title: '加入成功！',
        message: '快進遊戲查看吧！',
        type: 'success',
        zIndex: 9999
    });
    clickedButtons.delete(id);
};

const joinBtn = (MemberCount: number, MaxMemberCount: number, BroadcastSetting: number): string => {
    if (MemberCount >= MaxMemberCount) {
        return "人數已滿";
    }
    if (BroadcastSetting !== 3) {
        return "限制加入";
    }
    return "顯示房間";
};

const isBtnDisabled = (MemberCount: number, MaxMemberCount: number, BroadcastSetting: number): boolean => {
    if (MemberCount >= MaxMemberCount) {
        return true;
    }
    if (BroadcastSetting !== 3) {
        return true;
    }
    return false;
};


</script>

<template>
    <div class="common-layout">
        <el-container>
            <el-header>
                <h2 class="title">Minecraft基岩版線上多人遊戲列表</h2>
            </el-header>
            <el-main>
                <el-scrollbar height="100%">
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

                                    <span class="gamerName"
                                          v-html="parseMinecraftColors(d.customProperties.worldName)"></span>
                                </div>
                            </template>
                            <template #default>
                                <p>主機用戶：{{ d.customProperties.hostName }}</p>
                                <p>房間人數：{{ d.customProperties.MemberCount }}/{{
                                        d.customProperties.MaxMemberCount
                                    }}</p>
                                <p>遊戲模式：{{
                                        gameMode(d.customProperties.worldType, d.customProperties.isHardcore)
                                    }}</p>
                                <p>多人遊戲源：{{ d.sourceName }}</p>
                                <p>開放時間：{{ changeTime(d.relatedInfo.postedTime) }}</p>
                            </template>
                            <template #footer>
                                <el-tag type="primary">{{ d.customProperties.version }}</el-tag>
                                <el-button
                                    :disabled="isBtnDisabled(d.customProperties.MemberCount, d.customProperties.MaxMemberCount, d.customProperties.BroadcastSetting) || clickedButtons.has(d.id)"
                                    class="check-btn" size="small"
                                    type="primary"
                                    @click="wsJoin(d.id,d.sessionRef.name ,d.sourceName, d.sourceId)">
                                    {{
                                        joinBtn(d.customProperties.MemberCount, d.customProperties.MaxMemberCount, d.customProperties.BroadcastSetting)
                                    }}
                                </el-button>

                            </template>
                        </el-card>
                    </div>
                </el-scrollbar>

            </el-main>
            <el-footer>
                <div class="footer">

                    友鏈：
                    <el-link href="https://mcxbox.pages.dev/"
                             type="primary">MC房间查看
                    </el-link>

                </div>
            </el-footer>
        </el-container>


    </div>
    <el-affix :offset="20" class="set-right-bottom" position="bottom">
        <el-button :icon="Setting" circle size="large" type="primary" @click="dialogFormVisible=true"></el-button>

    </el-affix>

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

    <el-dialog v-model="dialogFormVisible" :width="dialogStyle()" height="300"
               title="設定">
        <el-row>
            <el-col :span="24" class="setText">
                <el-text size="large">顯示設定</el-text>
            </el-col>
            <el-col :span="24">
                <el-checkbox-group v-model="store.ShowRoom">
                    <el-checkbox :value="{ id: 0, name: 'unavailable' }" label="隱藏不可加入的多人遊戲"/>
                    <el-checkbox :value="{id: 2, name: 'MultiMC23'}" label="顯示MultiMC23的多人遊戲"/>
                    <el-checkbox :value="{ id: 3, name: 'gouhope' }" label="顯示gouhope的多人遊戲"/>
                </el-checkbox-group>
            </el-col>
            <el-col :span="24" class="setText">
                <el-text size="large">加入設定（已加誰為好友）</el-text>
            </el-col>
            <el-col :span="24">
                <el-radio-group v-model="store.Friends">

                    <el-radio :value="JSON.stringify({ id: 2, name: 'MultiMC23' })" size="large">MultiMC23（好友已滿，不要再加了）
                    </el-radio>
                    <el-radio :value="JSON.stringify({ id: 3, name: 'gouhope' })" size="large">gouhope（新用戶選這個）
                    </el-radio>
                </el-radio-group>
            </el-col>
        </el-row>

        <template #footer>
            <div class="dialog-footer">
                <el-button type="primary" @click="dialogFormVisible = false">確定</el-button>
            </div>
        </template>
    </el-dialog>
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
    bottom: 20px;
}

.color-right-bottom {
    position: fixed;
    z-index: 99999;
    right: 20px;
    bottom: 80px;
}

.set-right-bottom {
    position: fixed;
    z-index: 99999;
    right: 20px;
    bottom: 140px;

}

.setText {
    margin-top: 10px;
    margin-bottom: 10px;
}

</style>