Shelly Schedule w/Holidays
Version 4

HOW TO USE
•Register the Shelly device in the app/cloud, do a firmware update (tested on version 20240425-141453/1.3.0-ga3fdd3d).
•Go to http://{SHELLY_IP]/#/settings/debug and enable websocket debug to stream logs.
•Create one script for"script" one for "watchdog" in “Scripts”. In the first file set /* User defined variables */ and paste the contents of the file. Then copy the contents of "wachdog". Finally run both scripts. By default, both scripts will periodically be run every 5 minutes. This can be changed by editing TIMESPEC within the code or editing the created schedule in “Schedules”. 
•After running the scripts, they will register themselves and create 2 schedules, one for script and one for watchdog.
•Outside of working hours the device will not automatically turn off if user manually powers it on. 
•Current device information is displayed to console when script runs. To limit the amount of information output to the console log, set enableLogs to false. 
•Power consumption is read from device and console logged as Total consumed energy and its CO2 equivalent emissions in grams at the end of each day and every time the script is called.  
•Add and remove holiday dates by calling respective function, example in line 245.
•Watchdog script monitors and restarts main script if it fails. 
•To see the local network debug logs: http://{SHELLY_IP}/debug/log
•If a script does not register in schedules, create a script and pate contents of "scheduler" and then overwrite the file with the contents of watchdog. 
 

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

