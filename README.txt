Shelly Schedule w/Holidays
Version 4


Status quo:

Currently Shelly Plugs and switches have a way to schedule on/off times based on weekdays and time.

One can schedule as follows:
M T W T F	- on time
M T W T F	- off time
This will turn the device as scheduled above on and off.

However, this does not allow for Holydays where the Device should stay off regardless of its schedule.



Objective:

1.	Find a way to read a current holiday schedule online for the location of the Shelly device.
2.	Based on this information and the location, extend or overwrite a current schedule.
3.	Allow to define in the app (or…) if the device should stay on or off on a particular holiday.
4.	Indicate if a particular schedule is overwritten / affected by the holiday schedule



Additional Tasks:
1.	Verify communication requirements between Shelly Device and Internet
a.	firewall/permissions
b.	ports that need to be open (+direction)
c.	communication host IP/URL
i.	their cloud server
ii.	3rd party services used in the script
2.	Develop and demonstrate a process to remotely update and restart a script on a target Shelly device. 



Describe the Solution implemented for final review:

This script runs locally on a Shelly Plug S device. It connects to the internet to retrieve current city, date and all the holidays in current year and compares them to determine if the device should be powered on or off. On days that are not holidays, it is also possible to specifically set the times the device should be powered on and to add specific dates that count as a holiday. The script is called once every minute from Monday to Friday, this is easily adaptable for different times. 


Overwiew: 

1. Schedule Setup:
Sets up a schedule to run the script every minute on set days.
Location and Time Retrieval:
Retrieves the current location (city) using an IP-based location API.
Retrieves the current date and time in Austria using an API.

2. Holiday Check:
Retrieves a list of public holidays for Austria from an API and checks if today is a holiday.
If today is a holiday, it turns off the device. Possible to add or ignore holidays from list. 

3. Working Hours Check:
If today is not a holiday, it checks if the current time is within the specified working hours.
If the current time is within the working hours, it turns on the device; otherwise, it turns it off.

Additional Tasks: 
1. Communication requirements:

2. Ports that need to be open: Make sure that the following ports are opened in your network in order for everything to work as expected: 6010, 6011, 6012, 6020, 6021, 6022, 6110, 6113, 5353, 443.

3. Communication host: https://ipinfo.io/ has a 50.000 API requests per month. Running the script once a minute every weekday totals ~6.200 API requests per month.

4. Remote update and restart: Remote access to edit or restart the script of a registered device is easily possible via the Shelly App or via cloud: https://control.shelly.cloud/


•	After registering the shelly device in the app/cloud copy and paste the script in “Scripts” and run it. By default, the script will periodically be run every 5 minutes. This can be changed by editing the code or editing the created schedule in “Schedules”. 
•	After running the script, it will register itself and create a schedule.
•	Within the script set On/Off hours for each day and the days the device is not powered on in “User defined variables”.  
•	To limit the amount of information output to the console log, set enableLogs to false. 
• Add and remove holiday dates by calling respective function, example in line 248.
•	Power consumption is read from device and console logged as Total consumed energy and its CO2 equivalent emissions in grams at the end of each day.  
• Watchdog script monitors and restarts main script. Important: change the IP address in watchdog script.
• To see the logs: http://{SHELLY_IP}/debug/log
