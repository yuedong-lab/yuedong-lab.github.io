//RC-26.08.21-1
//自动获取时间（豆包AI生成）
let baseNetTimestamp = null;
let perfStart = 0;

async function fetchTime(){
    try {
        const resp = await fetch("https://worldtimeapi.org/api/timezone/Asia/Shanghai", {
            cache:"no-store"
        });
        const json = await resp.json();
        return Date.parse(json.datetime)
    }catch{
        return null;
    }
}

async function syncTimeBase(){
    const netTs = await fetchTime();
    if(netTs){
        baseNetTimestamp = netTs;
        perfStart = performance.now();
    }
}

function getDate(){
    if(!baseNetTimestamp){
        return new Date();
    }
    const deltaMs = performance.now() - perfStart;
    return new Date(baseNetTimestamp + deltaMs);
}