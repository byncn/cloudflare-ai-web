import Dexie, {type Table} from 'dexie';

export class Database extends Dexie {
    history!: Table<HistoryItem>
    tab!: Table<TabItem>

    constructor() {
        super('ai')
        this.version(4).stores({
            history: '++id, session, type, role, content, src',
            tab: '++id, label'
        })
        this.version(5).stores({
            tab: '++id, label, created_at',
            history: '++id, session, type, role, content, src, created_at',
        }).upgrade(trans => {
            return trans.table('history').toCollection().modify(async i => {
                if (i.type === 'image') {
                    i.content = ''
                    i.src = [i.src]
                }
            })
        })
    }

    getLatestTab() {
        return DB.tab.orderBy('id').last();
    }

    getTabs() {
        return DB.tab.limit(100).reverse().toArray()
    }

    async getHistory(session: number) {
        const arr = await DB.history.where('session').equals(session).limit(100).toArray()
        arr.forEach(i => {
            if (i.type === 'image') {
                i.src_url = []
                i.src?.forEach(src => {
                    i.src_url!.push(URL.createObjectURL(src))
                })
                i.content = 'image'
            }
        })
        return arr
    }

    addTab(label: string) {
        return DB.tab.add({label, created_at: Date.now()})
    }

    deleteTabAndHistory(id: number) {
        return DB.transaction('rw', DB.tab, DB.history, async () => {
            await DB.tab.delete(id)
            await DB.history.where('session').equals(id).delete()
        })
    }
}

export const DB = new Database();

export const initialSettings = {
    openaiKey: '',
    image_steps: 20,
    system_prompt: '这是ChatGPT，一个由OpenAI训练的大型语言模型。请仔细按照用户的指示进行操作。使用markdown进行回复。',
}

export type Settings = typeof initialSettings

export const uniModals: Model[] = [
    {
        id: 'gemini-1.5-flash',
        name: 'Gemini 1.5 flash',
        provider: 'google',
        type: 'universal'
    },
    {
        id: 'gemini-1.5-pro',
        name: 'Gemini 1.5 Pro',
        provider: 'google',
        type: 'universal'
    }
]

export const textGenModels: Model[] = [{
    id: 'gpt-3.5-turbo',
    name: 'ChatGPT-3.5-turbo',
    provider: 'openai',
    endpoint: 'chat/completions',
    type: 'chat'
}, {
    id: '@cf/qwen/qwen1.5-14b-chat-awq',
    name: 'qwen1.5-14b-chat-awq',
    provider: 'workers-ai',
    type: 'chat'
}, {
    id: '@cf/openchat/openchat-3.5-0106',
    name: 'openchat-3.5-0106',
    provider: 'workers-ai',
    type: 'chat'
}, {
    id: '@cf/google/gemma-7b-it-lora',
    name: 'gemma-7b-it-lora',
    provider: 'workers-ai',
    type: 'chat'
}, {
    id: '@hf/google/gemma-7b-it',
    name: 'gemma-7b-it',
    provider: 'workers-ai',
    type: 'chat'
}, {
    id: '@hf/meta-llama/meta-llama-3-8b-instruct',
    name: 'meta-llama-3-8b-instruct',
    provider: 'workers-ai',
    type: 'chat'
}, {
    id: '@hf/mistral/mistral-7b-instruct-v0.2',
    name: 'mistral-7b-instruct-v0.2',
    provider: 'workers-ai',
    type: 'chat'
}, {
    id: '@hf/google/gemma-7b-it',
    name: 'gemma-7b-it',
    provider: 'workers-ai',
    type: 'chat'
}, {
    id: '@hf/google/gemma-7b-it',
    name: 'gemma-7b-it',
    provider: 'workers-ai',
    type: 'chat'
}, {
    id: '@hf/google/gemma-7b-it',
    name: 'gemma-7b-it',
    provider: 'workers-ai',
    type: 'chat'
}, {
    id: '@hf/google/gemma-7b-it',
    name: 'gemma-7b-it',
    provider: 'workers-ai',
    type: 'chat'
}, {
    id: '@hf/thebloke/deepseek-coder-6.7b-instruct-awq',
    name: 'deepseek-coder-6.7b-instruct-awq',
    provider: 'workers-ai',
    type: 'chat'
}, {
    id: '@cf/meta/llama-3.2-11b-vision-instruct',
    name: '@cf/meta/llama-3.2-11b-vision-instruct',
    provider: 'workers-ai',
    type: 'chat'
}, {
    id: '@hf/thebloke/openhermes-2.5-mistral-7b-awq',
    name: 'openhermes-2.5-mistral-7b-awq',
    provider: 'workers-ai',
    type: 'chat'
}, {
    id: '@hf/thebloke/neural-chat-7b-v3-1-awq',
    name: 'neural-chat-7b-v3-1-awq',
    provider: 'workers-ai',
    type: 'chat'
}, {
    id: '@hf/nexusflow/starling-lm-7b-beta',
    name: 'starling-lm-7b-beta',
    provider: 'workers-ai',
    type: 'chat'
}, {
    id: '@cf/meta/llama-3.2-3b-instruct',
    name: 'llama-3.2-3b-instruct',
    provider: 'workers-ai',
    type: 'chat'
}, {
    id: '@cf/meta/llama-3.2-11b-vision-instruct',
    name: '@cf/meta/llama-3.2-11b-vision-instruct',
    provider: 'workers-ai',
    type: 'chat'
}, {
    id: '@cf/meta/llama-3-8b-instruct',
    name: 'llama-3-8b-instruct',
    provider: 'workers-ai',
    type: 'chat'
}]

export const imageGenModels: Model[] = [{
    id: '@cf/lykon/dreamshaper-8-lcm',
    name: 'dreamshaper-8-lcm',
    provider: 'workers-ai-image',
    type: 'text-to-image'
}, {
    id: '@cf/stabilityai/stable-diffusion-xl-base-1.0',
    name: 'stable-diffusion-xl-base-1.0',
    provider: 'workers-ai-image',
    type: 'text-to-image'
}, {
    id: '@cf/bytedance/stable-diffusion-xl-lightning',
    name: 'stable-diffusion-xl-lightning',
    provider: 'workers-ai-image',
    type: 'text-to-image'
}, {
    id: '@cf/black-forest-labs/flux-1-schnell',
    name: 'flux-1-schnell',
    provider: 'workers-ai-image',
    type: 'text-to-image'
}, {
    id: '@cf/runwayml/stable-diffusion-v1-5-img2img',
    name: 'stable-diffusion-v1-5-img2img',
    provider: 'workers-ai-image',
    type: 'text-to-image'
}, {
    id: '@cf/runwayml/stable-diffusion-v1-5-inpainting',
    name: 'stable-diffusion-v1-5-inpainting',
    provider: 'workers-ai-image',
    type: 'text-to-image'
}]

export const models: Model[] = [...uniModals, ...textGenModels, ...imageGenModels]