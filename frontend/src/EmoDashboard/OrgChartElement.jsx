import React from 'react';
import { Card, Avatar } from 'antd';

const OrgChartElement = ({ element, onAdd }) => {
  return (
    <div className="org-chart-element">
      <Card
        size="small"
        style={{ width: 200 }}
        actions={[
          <span key="add" onClick={() => onAdd(element, 'subordinate')}>Add</span>
        ]}
      >
        <Card.Meta
          avatar={<Avatar>{element.name.charAt(0)}</Avatar>}
          title={element.name}
          description={element.position}
        />
      </Card>
    </div>
  );
};

export default OrgChartElement;