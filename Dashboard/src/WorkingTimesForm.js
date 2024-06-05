import React, { useState } from 'react';
import { TimePicker, Button, Space } from 'antd';
import { CloseOutlined } from '@ant-design/icons';
import moment from 'moment';

const WorkingTimesForm = ({ onSubmit }) => {
  const [events, setEvents] = useState({
    Monday: [],
    Tuesday: [],
    Wednesday: [],
    Thursday: [],
    Friday: [],
    Saturday: [],
    Sunday: [],
  });
  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  const handleAddEvent = (day) => {
    setEvents({
      ...events,
      [day]: [...events[day], { on: '', off: '' }]
    });
  };

  const handleTimeChange = (day, index, timeString, field) => {
    const updatedEvents = { ...events };
    updatedEvents[day] = updatedEvents[day].map((event, i) =>
      i === index ? { ...event, [field]: timeString } : event
    );
    setEvents(updatedEvents);
  };

  const handleDeleteEvent = (day, index) => {
    const updatedEvents = { ...events };
    updatedEvents[day].splice(index, 1);
    setEvents(updatedEvents);
  };

  const handleSubmit = () => {
    console.log('onOffTimes = ', JSON.stringify(events, null, 2));
    onSubmit(events);
  };

  return (
    <div>
      <Space direction="vertical">
        {daysOfWeek.map(day => (
          <div key={day}>
            <span>{day}</span>
            <Button type="primary" onClick={() => handleAddEvent(day)}>
              Add Event
            </Button>
            {events[day] && events[day].map((event, index) => (
              <div key={index}>
                <TimePicker
                  onChange={(time, timeString) => handleTimeChange(day, index, timeString, 'on')}
                  value={event.on ? moment(event.on, 'HH:mm') : null}
                  format={'HH:mm'}
                  showNow={false}
                  showOk={false}
                />
                <TimePicker
                  onChange={(time, timeString) => handleTimeChange(day, index, timeString, 'off')}
                  value={event.off ? moment(event.off, 'HH:mm') : null}
                  format={'HH:mm'}
                  showNow={false}
                  showOk={false}
                />
                <Button type="danger" onClick={() => handleDeleteEvent(day, index)} icon={<CloseOutlined />} />
              </div>
            ))}
          </div>
        ))}
      </Space>

      <Button type="primary" onClick={handleSubmit}>
        Submit
      </Button>
    </div>
  );
};

export default WorkingTimesForm;
