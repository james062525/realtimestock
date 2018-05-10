#!/usr/bin/env python3
# -*- coding: utf-8 -*-
# python3 stocklist.py > stocklist.js

import requests
from bs4 import BeautifulSoup

def isNotEmpty(s):
    return bool(s and s.strip())

def getStock():
    url = "http://isin.twse.com.tw/isin/C_public.jsp?strMode=2"
    res = requests.get(url, verify=False)
    soup = BeautifulSoup(res.text, 'html.parser')

    table = soup.find("table", {"class" : "h4"})

    print('var stockList = [')
    for rows in table.find_all("tr"):
        for col in rows.find_all('td'):
            col.attrs = {}
            if "\u3000" in col.text:
                stock_token, stock_name = col.text.strip().split('\u3000')
                stock_list = "{value:'" + stock_token + " " + stock_name + "',data:'" + stock_token + "'},"
                #import pdb; pdb.set_trace()
                print(stock_list)

    print('];')

def main():
    getStock()

if __name__ == '__main__':
    main()
