import React, { useState } from 'react';
import { TimePicker, Button, Space } from 'antd';
import { CloseOutlined } from '@ant-design/icons';
import moment from 'moment';

const WorkingTimesForm = ({ onSubmit }) => {
  const [workingTimes, setWorkingTimes] = useState([]);
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

    // Check if both 'on' and 'off' fields are filled for all events
    if (updatedEvents[day].every(event => event.on && event.off)) {
      // Save the working times
      setWorkingTimes([...workingTimes, { day, events: updatedEvents[day] }]);
    }
  };

  const handleDeleteEvent = (day, index) => {
    const updatedEvents = { ...events };
    updatedEvents[day].splice(index, 1);
    setEvents(updatedEvents);
  };

  const handleSubmit = () => {
    onSubmit(workingTimes);
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
                  defaultValue={moment('00:00', 'HH:mm')}
                  value={event.on ? moment(event.on, 'HH:mm') : null}
                  format={'HH:mm'}
                  showNow={false}
                  showOk={false}
                />
                <TimePicker
                  onChange={(time, timeString) => handleTimeChange(day, index, timeString, 'off')}
                  defaultValue={moment('00:00', 'HH:mm')}
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

      <div>
        {workingTimes.map((time, index) => (
          <div key={index}>
            <p>{`Day: ${time.day}, Events: ${JSON.stringify(time.events)}`}</p>
          </div>
        ))}
      </div>

      <Button type="primary" onClick={handleSubmit}>
        Submit
      </Button>
    </div>
  );
};

export default WorkingTimesForm;

