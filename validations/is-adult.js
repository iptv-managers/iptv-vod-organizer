export function isAdult(stream) {
    if (!stream) {
        return false;
    }

    const name = stream?.stream_display_name ?? stream?.title;
    if(name.toLowerCase().includes('xxx') || 
         name.toLowerCase().includes('adult') ||
         name?.toLowerCase()?.includes('adult') ||
         name?.toLowerCase()?.includes('xxx')
        ) {
          return true;
     }
     return false;
}