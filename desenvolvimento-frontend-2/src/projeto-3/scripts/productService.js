export async function loadData() {
    let response = await fetch('data/data.json')
    response = await response.json()
    return response
}