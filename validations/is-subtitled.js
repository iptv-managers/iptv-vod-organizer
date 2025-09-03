export function isSubtitled(stream) {
    if (!stream) {
        return false;
    }

    const name = stream?.stream_display_name ?? stream?.title;
    if(name.toLowerCase().includes('legendado') || 
         name.toLowerCase().includes('legendado em') ||
         name.toLowerCase().includes('legendas') ||
         name.toLowerCase().includes('[leg]]') ||
         name.toLowerCase().includes('(leg)]') ||
         name.toLowerCase().includes('(l)]') ||
         name.toLowerCase().includes('[l]') ||
         stream.category_names?.toLowerCase()?.includes('legendado') ||
         stream.category_names?.toLowerCase()?.includes('legendada')
        ) {
          return true;
     }
     return false;
}