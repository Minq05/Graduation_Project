import { useState, useEffect } from 'react';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { 
  provinces, 
  districts, 
  wards, 
  getDistrictsByProvinceCode, 
  getWardsByDistrictCode 
} from '@/data/vietnam-provinces';
import { Label } from '@/components/ui/label';

export interface AddressData {
  fullNameCode: string;
  fullName: string;
  phoneCode: string;
  phone: string;
  provinceCode: string;
  provinceName: string;
  districtCode: string;
  districtName: string;
  wardCode: string;
  wardName: string;
  streetAddressCode: string;
  streetAddress: string;
}

interface AddressSelectorProps {
  onChange: (data: AddressData) => void;
  initialData?: AddressData;
}

// Danh sách họ tên mẫu
const fullNameOptions = [
  { code: 'fn1', name: 'Nguyễn Văn A' },
  { code: 'fn2', name: 'Trần Thị B' },
  { code: 'fn3', name: 'Lê Văn C' },
  { code: 'fn4', name: 'Phạm Thị D' },
  { code: 'fn5', name: 'Hoàng Văn E' },
];

// Danh sách số điện thoại mẫu
const phoneOptions = [
  { code: 'p1', name: '0912345678' },
  { code: 'p2', name: '0987654321' },
  { code: 'p3', name: '0909123456' },
  { code: 'p4', name: '0978123456' },
  { code: 'p5', name: '0932123456' },
];

// Danh sách địa chỉ cụ thể mẫu
const streetAddressOptions = [
  { code: 'sa1', name: 'Số 123 Đường ABC' },
  { code: 'sa2', name: 'Số 456 Đường XYZ' },
  { code: 'sa3', name: 'Tòa nhà A, Số 789 Đường DEF' },
  { code: 'sa4', name: 'Căn hộ 101, Chung cư B, Đường GHI' },
  { code: 'sa5', name: 'Số 321 Ngõ 56 Đường JKL' },
];

export const AddressSelector = ({ onChange, initialData }: AddressSelectorProps) => {
  const [fullNameCode, setFullNameCode] = useState(initialData?.fullNameCode || '');
  const [phoneCode, setPhoneCode] = useState(initialData?.phoneCode || '');
  const [provinceCode, setProvinceCode] = useState(initialData?.provinceCode || '');
  const [districtCode, setDistrictCode] = useState(initialData?.districtCode || '');
  const [wardCode, setWardCode] = useState(initialData?.wardCode || '');
  const [streetAddressCode, setStreetAddressCode] = useState(initialData?.streetAddressCode || '');
  
  const [availableDistricts, setAvailableDistricts] = useState(
    provinceCode ? getDistrictsByProvinceCode(provinceCode) : []
  );
  const [availableWards, setAvailableWards] = useState(
    districtCode ? getWardsByDistrictCode(districtCode) : []
  );

  // Cập nhật quận/huyện khi thay đổi tỉnh/thành phố
  useEffect(() => {
    if (provinceCode) {
      const newDistricts = getDistrictsByProvinceCode(provinceCode);
      setAvailableDistricts(newDistricts);
      
      // Reset quận/huyện và phường/xã nếu đổi tỉnh/thành phố
      if (!newDistricts.some(d => d.code === districtCode)) {
        setDistrictCode('');
        setWardCode('');
        setAvailableWards([]);
      }
    } else {
      setAvailableDistricts([]);
      setDistrictCode('');
      setWardCode('');
      setAvailableWards([]);
    }
  }, [provinceCode, districtCode]);

  // Cập nhật phường/xã khi thay đổi quận/huyện
  useEffect(() => {
    if (districtCode) {
      const newWards = getWardsByDistrictCode(districtCode);
      setAvailableWards(newWards);
      
      // Reset phường/xã nếu đổi quận/huyện
      if (!newWards.some(w => w.code === wardCode)) {
        setWardCode('');
      }
    } else {
      setAvailableWards([]);
      setWardCode('');
    }
  }, [districtCode, wardCode]);

  // Gửi dữ liệu địa chỉ lên component cha khi có thay đổi
  useEffect(() => {
    const selectedFullName = fullNameOptions.find(f => f.code === fullNameCode);
    const selectedPhone = phoneOptions.find(p => p.code === phoneCode);
    const selectedProvince = provinces.find(p => p.code === provinceCode);
    const selectedDistrict = districts.find(d => d.code === districtCode);
    const selectedWard = wards.find(w => w.code === wardCode);
    const selectedStreetAddress = streetAddressOptions.find(s => s.code === streetAddressCode);

    onChange({
      fullNameCode,
      fullName: selectedFullName?.name || '',
      phoneCode,
      phone: selectedPhone?.name || '',
      provinceCode,
      provinceName: selectedProvince?.name || '',
      districtCode,
      districtName: selectedDistrict?.name || '',
      wardCode,
      wardName: selectedWard?.name || '',
      streetAddressCode,
      streetAddress: selectedStreetAddress?.name || ''
    });
  }, [fullNameCode, phoneCode, provinceCode, districtCode, wardCode, streetAddressCode, onChange]);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="fullName">Họ và tên</Label>
          <Select value={fullNameCode} onValueChange={setFullNameCode}>
            <SelectTrigger id="fullName" className="mt-1">
              <SelectValue placeholder="Chọn họ và tên" />
            </SelectTrigger>
            <SelectContent>
              {fullNameOptions.map((option) => (
                <SelectItem key={option.code} value={option.code}>
                  {option.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="phone">Số điện thoại</Label>
          <Select value={phoneCode} onValueChange={setPhoneCode}>
            <SelectTrigger id="phone" className="mt-1">
              <SelectValue placeholder="Chọn số điện thoại" />
            </SelectTrigger>
            <SelectContent>
              {phoneOptions.map((option) => (
                <SelectItem key={option.code} value={option.code}>
                  {option.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <Label htmlFor="province">Tỉnh/Thành phố</Label>
          <Select value={provinceCode} onValueChange={setProvinceCode}>
            <SelectTrigger id="province" className="mt-1">
              <SelectValue placeholder="Chọn tỉnh/thành phố" />
            </SelectTrigger>
            <SelectContent>
              {provinces.map((province) => (
                <SelectItem key={province.code} value={province.code}>
                  {province.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="district">Quận/Huyện</Label>
          <Select 
            value={districtCode} 
            onValueChange={setDistrictCode}
            disabled={!provinceCode}
          >
            <SelectTrigger id="district" className="mt-1">
              <SelectValue placeholder="Chọn quận/huyện" />
            </SelectTrigger>
            <SelectContent>
              {availableDistricts.map((district) => (
                <SelectItem key={district.code} value={district.code}>
                  {district.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="ward">Phường/Xã</Label>
          <Select 
            value={wardCode} 
            onValueChange={setWardCode}
            disabled={!districtCode}
          >
            <SelectTrigger id="ward" className="mt-1">
              <SelectValue placeholder="Chọn phường/xã" />
            </SelectTrigger>
            <SelectContent>
              {availableWards.map((ward) => (
                <SelectItem key={ward.code} value={ward.code}>
                  {ward.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div>
        <Label htmlFor="streetAddress">Địa chỉ cụ thể</Label>
        <Select value={streetAddressCode} onValueChange={setStreetAddressCode}>
          <SelectTrigger id="streetAddress" className="mt-1">
            <SelectValue placeholder="Chọn địa chỉ cụ thể" />
          </SelectTrigger>
          <SelectContent>
            {streetAddressOptions.map((option) => (
              <SelectItem key={option.code} value={option.code}>
                {option.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};