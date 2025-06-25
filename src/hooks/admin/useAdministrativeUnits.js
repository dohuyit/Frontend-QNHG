import { useState, useEffect } from 'react';
import {
  getAllProvinces,
  getDistrictsByProvinceId,
  getWardsByDistrictId,
} from '@helpers/admin/administrative';

export const useProvinces = () => {
  const [provinces, setProvinces] = useState([]);

  useEffect(() => {
    const loadProvinces = async () => {
      const allProvinces = await getAllProvinces();
      setProvinces(allProvinces);
    };
    loadProvinces();
  }, []);

  return provinces;
};

export const useDistricts = (provinceId) => {
  const [districts, setDistricts] = useState([]);

  useEffect(() => {
    const loadDistricts = async () => {
      if (provinceId) {
        const allDistricts = await getDistrictsByProvinceId(provinceId);
        setDistricts(allDistricts);
      } else {
        setDistricts([]);
      }
    };
    loadDistricts();
  }, [provinceId]);

  return districts;
};

export const useWards = (districtId) => {
  const [wards, setWards] = useState([]);

  useEffect(() => {
    const loadWards = async () => {
      if (districtId) {
        const allWards = await getWardsByDistrictId(districtId);
        setWards(allWards);
      } else {
        setWards([]);
      }
    };
    loadWards();
  }, [districtId]);

  return wards;
}; 