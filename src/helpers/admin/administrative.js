import axios from 'axios';

let cachedLocations = null; // Cache để tránh gọi lại nhiều lần

export const fetchLocations = async () => {
  if (cachedLocations) return cachedLocations;

  try {
    const response = await axios.get('https://raw.githubusercontent.com/kenzouno1/DiaGioiHanhChinhVN/master/data.json');
    cachedLocations = response.data;
    return cachedLocations;
  } catch (error) {
    console.error("Lỗi khi tải dữ liệu địa giới hành chính:", error);
    return null;
  }
};

export const getProvinceNameById = async (provinceId) => {
  const locations = await fetchLocations();
  const province = locations?.find(p => p.Id === provinceId);
  return province ? province.Name : null;
};

export const getDistrictNameById = async (districtId) => {
  const locations = await fetchLocations();
  for (const province of locations || []) {
    const district = province.Districts.find(d => d.Id === districtId);
    if (district) return district.Name;
  }
  return null;
};

export const getWardNameById = async (wardId) => {
  const locations = await fetchLocations();
  for (const province of locations || []) {
    for (const district of province.Districts) {
      const ward = district.Wards.find(w => w.Id === wardId);
      if (ward) return ward.Name;
    }
  }
  return null;
};

// Mới: Lấy tất cả tỉnh/thành phố
export const getAllProvinces = async () => {
  const locations = await fetchLocations();
  return (locations || []).map(p => ({ id: p.Id, name: p.Name }));
};

// Mới: Lấy tất cả quận/huyện của một tỉnh/thành phố
export const getDistrictsByProvinceId = async (provinceId) => {
  const locations = await fetchLocations();
  const province = locations?.find(p => p.Id === provinceId);
  return (province?.Districts || []).map(d => ({ id: d.Id, name: d.Name }));
};

// Mới: Lấy tất cả phường/xã của một quận/huyện
export const getWardsByDistrictId = async (districtId) => {
  const locations = await fetchLocations();
  for (const province of locations || []) {
    const district = province.Districts.find(d => d.Id === districtId);
    if (district) {
      return (district.Wards || []).map(w => ({ id: w.Id, name: w.Name }));
    }
  }
  return [];
};
