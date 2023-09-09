import requests
from bs4 import BeautifulSoup
import json

# get capes cookies
with open('capes_cookies.json', 'r') as file:
    cookies = json.load(file)

headers = {
    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.0.0 Safari/537.36',
    'Accept-Encoding': '*',
}

url = 'https://cape.ucsd.edu/responses/Results.aspx?Name=%2C&CourseNumber='

response = requests.get(url, cookies=cookies, headers=headers)

# find table rows
soup = BeautifulSoup(response.text, 'html.parser')
table = soup.find('table')
table_body = table.find('tbody')
rows = table_body.find_all('tr')

data = []
for row in rows:
    cols = row.find_all('td')
    cols = [cols[0].replace(',', ''), cols[1], cols[2], cols[6], cols[7], cols[9]]
    cols = [cell.text.strip() for cell in cols]
    data.append([cell for cell in cols if cell])

with open(capes_data.csv, 'w') as file:
    file.write('Professor,Course,Term,Recommend Professor Percentage,Study Hours Per Week,Average Grade Received\n')

    for row in data:
        file.write(','.join(row) + '\n')