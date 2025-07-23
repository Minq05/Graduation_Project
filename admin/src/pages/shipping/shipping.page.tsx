import React from 'react';
import { Card, Tabs } from 'antd';
import ShippingManagement from '../../components/shipping/shipping.management';

const ShippingPage: React.FC = () => {
  return (
    <Card>
      <Tabs
        defaultActiveKey="management"
        items={[
          {
            key: 'management',
            label: 'Quản lý vận chuyển',
            children: <ShippingManagement />,
          }
        ]}
      />
    </Card>
  );
};

export default ShippingPage;