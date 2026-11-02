export type IconName = 'home' | 'heart' | 'drop' | 'meal' | 'activity' | 'book' | 'chart' | 'plus' | 'arrow' | 'check' | 'sun' | 'moon' | 'leaf' | 'close' | 'settings' | 'bell';
const paths: Record<IconName, string> = {
 home:'m3 10 9-7 9 7v10a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1Z',
 heart:'M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 21l8.8-8.6a5.5 5.5 0 0 0 0-7.8Z',
 drop:'M12 2S4 11 4 15a8 8 0 0 0 16 0c0-4-8-13-8-13Z',
 meal:'M4 3v7m3-7v7m3-7v7M4 7h6m-3 3v11M20 3c-6 2-6 9 0 9V3Zm0 9v9',
 activity:'M2 12h5l3-9 4 18 3-9h5', book:'M4 3h14a2 2 0 0 1 2 2v16H6a2 2 0 0 1-2-2V3Zm0 14h16M8 7h8m-8 4h6',
 chart:'M4 3v17h17M7 14l5-5 4 3 5-7',plus:'M12 5v14M5 12h14', arrow:'M4 12h16m-6-6 6 6-6 6', check:'m5 12 4 4L19 6',
 sun:'M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8ZM12 2v2m0 16v2M2 12h2m16 0h2M5 5l1 1m12 12 1 1M5 19l1-1M18 6l1-1',
 moon:'M20 14A8 8 0 0 1 10 4a8 8 0 1 0 10 10Z',leaf:'M20 3C7 2 2 8 5 15s16 6 15-12ZM5 19 15 9',
 close:'m6 6 12 12M6 18 18 6',settings:'M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8ZM12 2v3m0 14v3M2 12h3m14 0h3M5 5l2 2m10 10 2 2M5 19l2-2M17 7l2-2',
 bell:'M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9ZM9 21h6',
};
export function Icon({name,size=20}: {name:IconName;size?:number}) {return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={paths[name]}/></svg>}
export const themes = [{id:'dark',name:'Escuro',icon:'moon'},{id:'clean',name:'Claro',icon:'sun'},{id:'warm',name:'Suave',icon:'leaf'}] as const;
