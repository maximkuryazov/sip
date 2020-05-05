Установка - https://github.com/SIPp/sipp<br />
Документация - https://sipp.readthedocs.io/en/latest/sipp.html
<p />
sudo apt install baresip-core<br />
sudo apt-get install sip-tester<p />

Запуск: <br />
DEBUG=sipp:* npm start<br />
http://localhost:3000
<p />
Методы:<p />
/sipp/help<br />
/sipp/start<br />
/sipp/stop<br />
/sipp/pause<br />
/sipp/resume<br />
/sipp/start/xml<br />
/sipp/start/user-xml?xml=sipp_reg_UAC_v02.xml&csv=auth_users.csv&server=10.0.200.66&port=7060&users=10
<p />
Параметры:<p />
xml - файл xml-сценария<br />
csv - файл с данными пользователя<br />
server - хост<br />
port - порт<br />
users - кол-во юзеров<br />