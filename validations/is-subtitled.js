export function isSubtitled(stream) {
    if (!stream) {
        return false;
    }

    if(stream.stream_display_name.toLowerCase().includes('legendado') || 
         stream.stream_display_name.toLowerCase().includes('legendado em') ||
         stream.stream_display_name.toLowerCase().includes('legendas') ||
         stream.stream_display_name.toLowerCase().includes('[leg]]') ||
         stream.stream_display_name.toLowerCase().includes('(leg)]') ||
         stream.stream_display_name.toLowerCase().includes('(l)]') ||
         stream.stream_display_name.toLowerCase().includes('[l]') ||
         stream.category_names?.toLowerCase()?.includes('legendado')
        ) {
          return true;
     }
     return false;
}