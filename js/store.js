

const DB = {
  async load() {
    const res = await fetch(DATA_URL + "?_=" + Date.now());
    if (!res.ok) throw new Error("Gagal load data.json");
    return await res.json();
  }
};
