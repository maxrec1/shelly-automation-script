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
  const [showSchedule, setShowSchedule] = useState(false); // State to manage schedule display
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
    <div style={{ display: 'flex', justifyContent: 'center' }}>
      {/* Show/hide schedule button */}
      <div style={{ marginBottom: '10px' }}> {/* Add margin-bottom */}
        <Button onClick={() => setShowSchedule(!showSchedule)}>
          {showSchedule ? 'Hide Schedule' : 'Show Schedule'}
        </Button>
      </div>

      {/* Render schedule below the button */}
      {showSchedule && (
        <Space direction="vertical" style={{ marginTop: '10px' }}>
          {daysOfWeek.map(day => (
            <div key={day} style={{ marginBottom: '10px' }}> {/* Add margin-bottom */}
              <span style={{ marginRight: '10px' }}>{day}</span> {/* Add margin-right */}
              <Button type="primary" onClick={() => handleAddEvent(day)}>
                Add Event
              </Button>
              {events[day] && events[day].map((event, index) => (
                <div key={index}>
                 <TimePicker
  onCalendarChange={(time, timeString) => handleTimeChange(day, index, timeString, 'on')}
  value={event.on ? moment(event.on, 'HH:mm') : null}
  format={'HH:mm'}
  showNow={false}
/>
<TimePicker
  onCalendarChange={(time, timeString) => handleTimeChange(day, index, timeString, 'off')}
  value={event.off ? moment(event.off, 'HH:mm') : null}
  format={'HH:mm'}
  showNow={false}
/>

                  <Button type="danger" onClick={() => handleDeleteEvent(day, index)} icon={<CloseOutlined />} />
                </div>
              ))}
            </div>
          ))}
          {/* Submit button */}
          <Button type="primary" onClick={handleSubmit}>
            Submit
          </Button>
        </Space>
      )}
    </div>
  );
};

export default WorkingTimesForm;
