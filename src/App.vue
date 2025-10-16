<script lang="ts" setup>
import {mc_list, mc_join, mc_account, mc_profile} from "./utils/axios";
import {ref, onMounted, h, reactive, watch, computed} from "vue";
import {useWindowSize} from '@vueuse/core'
import {RefreshRight, Sunny, Moon, Setting, Search} from '@element-plus/icons-vue';
import {ElLoading, ElNotification, ElMessage} from "element-plus";
import 'element-plus/es/components/loading/style/css'
import 'element-plus/es/components/notification/style/css'
import 'element-plus/es/components/message/style/css'
import type {ButtonInstance} from 'element-plus'
import zhCn from 'element-plus/es/locale/lang/zh-cn';


import {isDark, toggleDark} from './utils/dark';

import {setLocale} from "./locale";

import {useI18n} from 'vue-i18n';

const {t} = useI18n();

let room_data = ref<any[]>([]);
let room_count = ref<number>(0);
let newRoom = ref<any[]>([]);
let isNull = ref<boolean>(false);
let progressHide = ref<boolean>(true);
const isDisabled = ref<boolean>(false);
let dialogFormVisible = ref<boolean>(false);
let dialogNotifyVisible = ref<boolean>(false);
const clickedButtons = new Set<string>();
const searchName = ref<string>('hostName')
const searchContent = ref<string>('')
const inputNotify = ref<string>('')
const isSkinVisible = ref<boolean>(false);
const imageSkinUrl = ref<string>('');
const gamerTag = ref<string>('');
const refSettingBtn = ref<ButtonInstance>();
const refJoinSetting = ref<ButtonInstance>();
const refXuidSetting = ref<ButtonInstance>();
const {width} = useWindowSize()
const dialogStyle = computed(() => width.value > 600 ? '600px' : '90%')

const accounts = ref<any[]>([]);

import {useMCOnlineStore} from './utils/store'

const store = useMCOnlineStore()

const getRoomData = async (): Promise<void> => {
    const loading = ElLoading.service({
        lock: true,
        text: t('locale.loading'),
        background: 'rgba(0, 0, 0, 0.7)',
    })

    let sources = store.ShowRoom

    try {
        const {data} = await mc_list(store.RoomNameLang);
        room_data.value = data.results;
        if (sources.find((source) => source.id === 0)) {
            room_data.value = room_data.value.filter((room: any) => {
                return !(room.customProperties.MemberCount >= room.customProperties.MaxMemberCount || room.customProperties.BroadcastSetting !== 3);
            });
        }
        newRoom.value = room_data.value
        room_count.value = room_data.value.length;
        isNull.value = room_data.value.length === 0;
    } catch (e) {
        ElNotification({
            title: t('locale.error'),
            message: t('locale.errorMessage'),
            type: 'error',
            zIndex: 9999
        });
    } finally {
        loading.close()

    }


};


onMounted(() => {
    setLocale(store.Language)
    getRoomData();
    metaThemeColor();
    dialogNotifyVisible.value = store.Notify
    getAccount()
});

const gameMode = (mode: string, isHar: boolean): string => {
    switch (mode) {
        case "Survival":
            return isHar ? t('mode.hardcore') : t('mode.survival');
        case "Creative":
            return t('mode.creative');
        case "Adventure":
            return t('mode.adventure');
        case "Spectator":
            return t('mode.spectator');
        default:
            return t('mode.unknown');
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
            const unicodeValue = unicodeChar.codePointAt(0)?.toString(16).toUpperCase();
            let unicodeNumber = Number(unicodeValue.slice(1));
            if (unicodeNumber >= 100 && unicodeNumber <= 113) {
                const svgPath = `/svg/${unicodeValue.toString(16).toUpperCase()}.svg`;
                return `<img src="${svgPath}" alt="${unicodeChar}" style="height: 1em; display: inline-block; vertical-align: middle;" />`;
            }
            return `<span>${unicodeChar}</span>`;

        }
        return match; // Default fallback
    }).replace(/<\/span>/g, () => isRandom ? `</span><span></span>` : "</span>");
};


const handleClick = (): void => {
    if (isDisabled.value) return;
    ElNotification({
        title: t('locale.refresh'),
        message: t('locale.refreshMessage'),
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

const wsJoin = async (roomFrom: string, id: string, name: string): Promise<void> => {
    ElNotification({
        title: t('locale.joining'),
        message: t('locale.joiningMessage'),
        type: 'warning',
        zIndex: 9999
    });
    if (clickedButtons.has(id)) return;
    clickedButtons.add(id);
    const Friends = JSON.parse(store.Friends)
    const setId = String(Friends.id)
    try {
        await mc_join(roomFrom, setId, id, name, store.Xuid);
    } catch (e) {
        ElNotification({
            title: t('locale.JoinsError'),
            message: t('locale.JoinsErrorMessage'),
            type: 'error',
            zIndex: 9999
        });
        return;
    } finally {
        clickedButtons.delete(id);

    }

    ElNotification({
        title: t('locale.Joins'),
        message: h('div', [
            h('p', t('locale.JoinsMessage')),
            h(
                'button',
                {
                    style: {
                        marginTop: '10px',
                        padding: '5px 10px',
                        backgroundColor: '#409EFF',
                        color: '#FFFFFF',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                    },
                    onClick: () => {
                        window.location.href = "minecraft://?addExternalServer=本地服务器|127.0.0.1:19132";
                    },
                },
                t('locale.mcStart')
            ),
        ]),
        type: 'success',
        zIndex: 9999,
        dangerouslyUseHTMLString: false,
    });
};

const joinBtn = (MemberCount: number, MaxMemberCount: number, BroadcastSetting: number): string => {
    if (MemberCount >= MaxMemberCount) {
        return t('button.full');
    }
    if (BroadcastSetting !== 3) {
        return t('button.limit');
    }
    return t('button.show');
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
const searchBtn = (): void => {
    room_data.value = newRoom.value;
    if (searchName.value === 'hostName') {
        room_data.value = room_data.value.filter((room: any) => {
            return room.customProperties.worldName.includes(searchContent.value);
        });
    } else {
        room_data.value = room_data.value.filter((room: any) => {
            return room.customProperties.hostName.includes(searchContent.value);
        });

    }

}
const clearBtn = (): void => {
    room_data.value = newRoom.value;

}
const inputBtn = (): void => {
    if (searchContent.value === '') {
        room_data.value = newRoom.value;
    }

}

const changeLanguage = (): void => {
    setLocale(store.Language)
}
const handleNotifyBtn = (): void => {
    if (inputNotify.value === '我已阅读' || inputNotify.value === 'I have read' || inputNotify.value === '我已閱讀') {
        dialogNotifyVisible.value = false
        store.Notify = false
    }
}

const showSkin = (xuid: string, type: string = 'btn'): void => {
    if (type === 'avatar' && store.ShowSkin.length === 0) {
        return
    }
    imageSkinUrl.value = `https://persona-secondary.franchise.minecraft-services.net/api/v1.0/profile/xuid/${xuid}/image/avatar`;
    isSkinVisible.value = true;
}

const showAvatar = (xuid: string): string => {
    if (store.ShowSkin.length === 0) {
        progressHide.value = false
        return '';
    } else {
        return `https://persona-secondary.franchise.minecraft-services.net/api/v1.0/profile/xuid/${xuid}/image/avatar`;

    }

}

const validateXuid = (): void => {
    if (store.Xuid.length !== 16) {
        store.Xuid = "";
    }
};

const getXuid = async (gt: string): Promise<void> => {
    try {
        const {data} = await mc_profile(gt);
        store.Xuid = String(data.profileUsers[0].id)
        store.Avatar = String(data.profileUsers[0].settings[0].value)
        ElNotification({
            title: t('setting.xuidSuccess'),
            message: t('setting.xuidSuccessMessage'),
            type: 'success',
            zIndex: 99999
        });
    } catch (e) {
        ElNotification({
            title: t('setting.xuidError'),
            message: t('setting.xuiderrorMessage'),
            type: 'error',
            zIndex: 99999
        });
    }


}

const copyText = async (text: string) => {
    try {
        await navigator.clipboard.writeText(text)
        ElMessage({
            message: t('locale.copy'),
            type: 'success',
        })

    } catch (e) {
        ElMessage({
            message: t('locale.copyError'),
            type: 'error',
        })
    }
}

const changeTour = (current: number): void => {
    dialogFormVisible.value = current === 2 || current === 3;

}
const font = reactive({
    color: 'rgba(0, 0, 0, .15)',
})

watch(
    isDark,
    () => {
        font.color = isDark.value
            ? 'rgba(255, 255, 255, .15)'
            : 'rgba(0, 0, 0, .15)'
    },
    {
        immediate: true,
    }
)


const changeJoinUser = (value: string): void => {
    copyText(JSON.parse(value).name)

};

const getAccount = async (): Promise<void> => {
    const {data} = await mc_account();
    accounts.value = data
    // if (store.Friends === "") {
    //     const firstValid = data.find((item: any) => item.canaddfriends);
    //     if (firstValid) {
    //         store.Friends = JSON.stringify(firstValid);
    //     }
    // }
}

const languages = [
    {value: 'zhHans', label: '简体中文'},
    {value: 'zhHant', label: '繁体中文'},
    {value: 'en', label: 'English'},
    {value: 'ja', label: '日本語'},
]

const RoomLangOption = computed(() => [
    {value: '', label: t('setting.roomNameNot')},
    {value: 'zh', label: '中文'},
    {value: 'en', label: 'English'},
    {value: 'ja', label: '日本語'},
    {value: 'ko', label: '한국어'},
    {value: 'ru', label: 'Русский'},
    {value: '', label: t('setting.roomNameOther'), disabled: true},
])

const changeRoomLang = async (): Promise<void> => {
    await getRoomData()
}

</script>

<template>

    <div class="common-layout">
        <el-watermark :content="['Minecraft基岩版', '联机大厅']" :font="font" :zIndex="1"
                      style="height: 100%; min-height: 100vh;">

            <el-container>
                <el-header>
                    <el-row class="header-container" justify="center" style="z-index: 1000 !important;">
                        <el-col><h2 class="title">{{ $t('locale.title') }}</h2></el-col>
                        <el-col :span="21" class="input-with-select">
                            <el-input
                                v-model="searchContent"
                                :placeholder="$t('search.placeholder')"
                                clearable
                                style="min-width: auto"
                                @clear="clearBtn()"
                                @input="inputBtn()"
                            >
                                <template #prepend>
                                    <el-select v-model="searchName" style="width: auto;min-width: 100px;">
                                        <el-option :label="$t('search.hostName')" value="hostName"/>
                                        <el-option :label="$t('search.userName')" value="userName"/>
                                    </el-select>
                                </template>
                                <template #append>
                                    <el-button :icon="Search" @click="searchBtn()"/>
                                </template>
                            </el-input>
                        </el-col>
                        <el-col class="room-total">
                            {{ $t('total.all') }}
                            <el-tag>{{ room_count }}</el-tag>
                            {{ $t('total.room') }}
                        </el-col>
                        <el-col>
                        </el-col>
                    </el-row>


                </el-header>
                <el-main>
                    <el-scrollbar height="100%">
                        <el-empty v-if="isNull">
                            <template #description>
                                <p>
                                    {{ $t('locale.null') }}
                                </p>
                                <p>
                                    {{ $t('locale.friend') }}
                                </p>
                            </template>
                        </el-empty>

                        <div class="card-container">


                            <el-card v-for="d in room_data" class="centered-card" style="z-index: 10 !important;">
                                <template #header>
                                    <div class="card-header">

                                    <span class="gamerName"
                                          v-html="parseMinecraftColors(d.customProperties.worldName)"></span>

                                    </div>
                                </template>
                                <template #default>
                                    <p>{{
                                            $t('room.hostName')
                                        }}
                                        <el-image
                                            :src="'https://persona-secondary.franchise.minecraft-services.net/api/v1.0/profile/xuid/'+''+d.customProperties.ownerId+'/image/head'"
                                            class="headImage"
                                            style="width: 1em;"
                                            @click="showSkin(d.customProperties.ownerId)">
                                            <template #error>
                                            </template>
                                        </el-image>

                                        <span style="margin-left: 0.5em" @click="copyText(d.customProperties.hostName)">{{
                                                d.customProperties.hostName
                                            }}</span>
                                    </p>
                                    <p>{{ $t('room.MemberCount') }}{{ d.customProperties.MemberCount }}/{{
                                            d.customProperties.MaxMemberCount
                                        }}</p>
                                    <p>{{ $t('room.gameMode') }}{{
                                            gameMode(d.customProperties.worldType, d.customProperties.isHardcore)
                                        }}</p>
                                    <p>{{ $t('room.createTime') }}{{ changeTime(d.createTime) }}</p>

                                    <el-progress
                                        v-if="progressHide"
                                        :percentage="d.customProperties.MemberCount / d.customProperties.MaxMemberCount * 100"
                                        type="circle"
                                        @click="showSkin(d.customProperties.ownerId,'avatar')">
                                        <template #default>

                                            <el-avatar :size="100"
                                                       :src="showAvatar(d.customProperties.ownerId)"
                                            />
                                        </template>

                                    </el-progress>
                                </template>
                                <template #footer>
                                    <el-tag type="primary">{{ d.customProperties.version }}</el-tag>
                                    <el-button
                                        :disabled="isBtnDisabled(d.customProperties.MemberCount, d.customProperties.MaxMemberCount, d.customProperties.BroadcastSetting) || clickedButtons.has(d.id)"
                                        class="check-btn" size="small"
                                        type="primary"
                                        @click="wsJoin(d.roomfrom,d.id,d.sessionRef.name)">
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

                        {{ $t('locale.link') }}
                        <el-link href="https://t.me/MCBE_Group"
                                 type="primary">{{ $t('locale.linkText') }}
                        </el-link>
                        <br>
                        文档站
                        <el-link href="https://docs.miaaoo.com/"
                                 type="primary">大厅文档说明
                        </el-link>
                        <br>
                        去除Ore UI版本
                        <el-link href="https://bbk.endyun.ltd/alist/"
                                 type="primary">点我下载
                        </el-link>
                    </div>
                </el-footer>
            </el-container>
        </el-watermark>

        <el-config-provider :locale="zhCn">
            <el-tour v-model="store.Tour" :z-index="100000" @change="changeTour" @close="store.Tour = false">
                <el-tour-step :title="$t('step.title')">
                    <template #default>
                        {{ $t('step.text1') }}
                        <el-link href="https://docs.miaaoo.com/" target="_blank" type="primary">{{ $t('step.text2') }}
                        </el-link>
                        {{ $t('step.text3') }}

                        <el-radio-group v-model="store.Language" @change="changeLanguage()">

                            <el-radio
                                v-for="lang in languages"
                                :key="lang.value"
                                :value="lang.value"
                                size="large"
                            >
                                {{ lang.label }}
                            </el-radio>
                        </el-radio-group>
                    </template>
                </el-tour-step>
                <el-tour-step :target="refSettingBtn?.$el" :title="$t('step.joinOneTitle')" placement="top">
                    <template #default>
                        {{ $t('step.joinOneText') }}
                    </template>
                </el-tour-step>
                <el-tour-step :target="refJoinSetting?.$el" :title="$t('step.joinTwoTitle')" placement="top">
                    <template #default>
                        {{ $t('step.joinTwoText1') }}
                        <el-link href="minecraft://" type="primary">{{ $t('step.joinTwoText2') }}</el-link>
                        {{ $t('step.joinTwoText3') }}
                    </template>
                </el-tour-step>
                <el-tour-step :target="refXuidSetting?.$el" :title="$t('step.joinThreeTitle')" placement="top">
                    <template #default>
                        {{ $t('step.joinThreeText') }}
                    </template>
                </el-tour-step>
                <el-tour-step :title="$t('step.joinLastTitle')" placement="top">
                    <template #default>
                        {{ $t('step.joinLastText1') }}<br>{{ $t('step.joinLastText2') }}<br>{{
                            $t('step.joinLastText3')
                        }}
                    </template>
                </el-tour-step>
                <el-tour-step :title="$t('step.showTitle')" placement="top">
                    <template #default>
                        {{ $t('step.showText') }}
                    </template>
                </el-tour-step>

            </el-tour>
        </el-config-provider>
    </div>
    <el-affix ref="refSettingBtn" :offset="20" class="set-right-bottom" position="bottom">
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
    <el-backtop :bottom="80" :right="80" style="z-index: 10 !important;"/>
    <el-dialog v-model="dialogFormVisible" :title="$t('setting.title')" :width="dialogStyle"
               :z-index="99999" height="300">
        <el-row>
            <el-avatar
                v-if="store.Avatar"
                :size="60"
                :src="store.Avatar"
                class="xbox-avatar"
                shape="square"
            />
            <el-col :span="24" class="setText">
                <el-text size="large">{{ $t('setting.display') }}</el-text>
            </el-col>
            <el-col :span="24">
                <el-checkbox-group v-model="store.ShowRoom">
                    <el-checkbox :label="$t('setting.notJoin')" :value="{ id: 0, name: 'unavailable' }"/>
                </el-checkbox-group>
                <el-checkbox-group v-model="store.ShowSkin">
                    <el-checkbox :label="$t('setting.hideSkin')" :value="true"/>
                </el-checkbox-group>
            </el-col>
            <el-col :span="24">
                <el-select v-model="store.RoomNameLang" :placeholder="$t('setting.roomName')" :reserve-keyword="false"
                           :teleported="false"
                           allow-create
                           filterable style="width: auto" @change="changeRoomLang">
                    <el-option
                        v-for="item in RoomLangOption"
                        :key="item.value"
                        :disabled="item.disabled"
                        :label="item.label"
                        :value="item.value"
                    >
                        <span style="float: left">{{ item.label }}</span>
                        <span style="float: right; color: var(--el-text-color-secondary); font-size: 13px;">{{
                                item.value
                            }} </span>
                    </el-option>

                </el-select>
            </el-col>
            <el-col :span="24" class="setText">
                <el-text size="large">{{ $t('setting.joinSetting') }}</el-text>
            </el-col>
            <el-col ref="refJoinSetting" :span="24">
                <el-radio-group v-model="store.Friends" @change="changeJoinUser">
                    <el-radio v-for="item in accounts" :value="JSON.stringify(item)" size="large">
                        {{ item.name }}{{ item.canaddfriends ? $t('setting.userJoin') : $t('setting.userFull') }}
                    </el-radio>
                </el-radio-group>

            </el-col>
            <el-col :span="24" class="setText">
                <el-text size="large">{{ $t('setting.join') }}</el-text>
            </el-col>
            <el-col ref="refXuidSetting" :span="24">
                <el-input
                    v-model="gamerTag"
                    :placeholder="$t('setting.inputGamerTag')"
                    style="margin-bottom: 1em"
                    type="text"
                    @input="gamerTag = gamerTag.replace(/[^A-Za-z0-9# ]/g, '')"
                >
                    <template #append>
                        <el-button type="primary" @click="getXuid(gamerTag)">{{ $t('setting.getXuid') }}</el-button>
                    </template>
                    <template #prepend>{{ $t('setting.gamerTag') }}</template>
                </el-input>
                <el-input
                    v-model="store.Xuid"
                    :placeholder="$t('setting.inputXuid')"
                    maxlength="16"
                    show-password
                    show-word-limit
                    style="margin-bottom: 1em"
                    type="text"
                    @blur="validateXuid"
                    @input="store.Xuid = store.Xuid.replace(/\D/g, '')"
                >
                    <template #prepend>XUID</template>
                    <template #suffix>
                      <span style="font-size: 12px; color: #999999;">
                        {{ store.Xuid.length }}/16
                      </span>
                    </template>
                </el-input>
            </el-col>
            <el-col :span="24" class="setText">
                <el-text size="large">{{ $t('setting.language') }}
                    <el-link href="https://github.com/zihao-il/mc-miaaoo/tree/main/src/locale" target="_blank"
                             underline="never">
                        <svg height="1.2em" viewBox="0 0 24 24" width="1.2em" xmlns="http://www.w3.org/2000/svg">
                            <path
                                d="M12 1C5.923 1 1 5.923 1 12c0 4.867 3.149 8.979 7.521 10.436c.55.096.756-.233.756-.522c0-.262-.013-1.128-.013-2.049c-2.764.509-3.479-.674-3.699-1.292c-.124-.317-.66-1.293-1.127-1.554c-.385-.207-.936-.715-.014-.729c.866-.014 1.485.797 1.691 1.128c.99 1.663 2.571 1.196 3.204.907c.096-.715.385-1.196.701-1.471c-2.448-.275-5.005-1.224-5.005-5.432c0-1.196.426-2.186 1.128-2.956c-.111-.275-.496-1.402.11-2.915c0 0 .921-.288 3.024 1.128a10.2 10.2 0 0 1 2.75-.371c.936 0 1.871.123 2.75.371c2.104-1.43 3.025-1.128 3.025-1.128c.605 1.513.221 2.64.111 2.915c.701.77 1.127 1.747 1.127 2.956c0 4.222-2.571 5.157-5.019 5.432c.399.344.743 1.004.743 2.035c0 1.471-.014 2.654-.014 3.025c0 .289.206.632.756.522C19.851 20.979 23 16.854 23 12c0-6.077-4.922-11-11-11"
                                fill="currentColor"/>
                        </svg>
                    </el-link>
                </el-text>
            </el-col>
            <el-col :span="24">
                <el-radio-group v-model="store.Language" @change="changeLanguage()">

                    <el-radio
                        v-for="lang in languages"
                        :key="lang.value"
                        :value="lang.value"
                        size="large"
                    >
                        {{ lang.label }}
                    </el-radio>
                </el-radio-group>
            </el-col>

        </el-row>

        <template #footer>
            <div class="dialog-footer">
                <el-button type="primary" @click="dialogFormVisible = false">{{ $t('setting.enter') }}</el-button>
            </div>
        </template>
    </el-dialog>

    <el-dialog
        v-model="dialogNotifyVisible"
        :close-on-click-modal="false"
        :close-on-press-escape="false"
        :show-close="false"
        :title="$t('notify.title')"
        :width="dialogStyle"
        :z-index="99999"
        class="dialogNotify"
    >
        <p class="notify-text"><strong>{{ t('notify.text2') }}</strong>{{ t('notify.text3') }}</p>
        <p class="notify-text">{{ t('notify.text1') }}</p>
        <el-input
            v-model="inputNotify"
            :placeholder="$t('notify.placeholder')"
            clearable
        ></el-input>
        <template #footer>
            <div style="display: flex; justify-content: space-between; align-items: center; width: 100%;">
                <div>
                    <el-radio-group v-model="store.Language" @change="changeLanguage()">
                        <el-radio size="large" value="zhHans">
                            {{ $t('setting.zhHans') }}
                        </el-radio>
                        <el-radio size="large" value="zhHant">
                            {{ $t('setting.zhHant') }}
                        </el-radio>
                        <el-radio size="large" value="en">
                            {{ $t('setting.en') }}
                        </el-radio>
                    </el-radio-group>
                </div>
                <div>
                    <el-button type="primary" @click="handleNotifyBtn()">
                        {{ t('setting.enter') }}
                    </el-button>
                </div>
            </div>
        </template>
    </el-dialog>

    <el-image-viewer
        v-if="isSkinVisible"
        :hide-on-click-modal="true"
        :initial-index="0"
        :url-list="[imageSkinUrl]"
        @close="isSkinVisible = false"

    />

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
        display: block;
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
    flex: 1;
    white-space: normal;
    word-wrap: break-word;
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
    padding-bottom: 1em;
    text-align: center;
}

.affix-right-bottom {
    position: fixed;
    z-index: 99999;
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

.el-header {
    --el-header-height: auto;
}

.input-with-select {
    max-width: 700px !important;
    margin-top: 0.75em;
    margin-bottom: 0.75em;
}

.room-total {

    text-align: center;
}

.notify-text {
    margin-bottom: 0.75em;

}

.el-card {
    position: relative;
}

.el-progress {
    position: absolute;
    top: 0.25em;
    right: 0.25em;
}

.el-avatar {
    --el-avatar-bg-color: none;

}

.el-image {
    overflow: visible;
}

:deep(.headImage .el-image__inner) {
    vertical-align: middle !important;
}

.xbox-avatar {
    position: absolute;
    top: 1.5em;
    right: 0.5em;
}

:deep(.el-progress-circle) {
    opacity: 0.4;
}

</style>