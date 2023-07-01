
export const load = async ({url}) => {
    let hasError = url.searchParams.get('e');
    return {
        error:(hasError)?true:false
    }
}