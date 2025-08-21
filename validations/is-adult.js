export function isAdult(stream) {
    if (!stream) {
        return false;
    }

    if(stream.stream_display_name.toLowerCase().includes('xxx') || 
         stream.stream_display_name.toLowerCase().includes('adult') ||
         stream.category_names?.toLowerCase()?.includes('adult') ||
         stream.category_names?.toLowerCase()?.includes('xxx')
        ) {
          return true;
     }
     return false;
}