require('dotenv').config()

const express = require('express');
const axios = require('axios');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
const PORT = 3000;

app.use(bodyParser.json());
app.use(cors());

let accessToken = '';
let baseDomain = '';

// ПОЛУЧЕНИЕ ТОКЕНА
app.get('/get-token', async (req, res) => {
  try {
    const clientId = process.env.VUE_APP_CLIENT_ID
    const response = await axios.get('https://app2.gnzs.ru/amocrm/test/oauth/get-token.php', {
      headers: { 'X-Client-Id': clientId },
    });

    accessToken = response.data.access_token;
    baseDomain = response.data.base_domain;

    res.json({ message: 'Токен успешно получен', access_token: accessToken, base_domain: baseDomain });
  } catch (error) {
    console.error('Ошибка при получении токена:', error.message);
    res.status(500).json({ error: 'Не удалось получить токен', details: error.message });
  }
});

// СОЗДАНИЕ СДЕЛКИ ЧЕРЕЗ API amoCRM
app.post('/create-deal', async (req, res) => {
  const { name, price } = req.body;

  if (!name || !price) {
    return res.status(400).json({ error: 'Недостаточно данных для создания сделки' });
  }

  try {
    const response = await axios.post(
      `https://${baseDomain}/api/v4/leads`,
      { leads: [{ name, price }] },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (response.data._embedded && response.data._embedded.leads) {
      const createdDeal = response.data._embedded.leads[0];
      res.status(200).json({
        message: 'Сделка успешно создана',
        createdDeal: {
          id: createdDeal.id,
          name: createdDeal.name,
          price: createdDeal.price,
        },
      });
    } else {
      throw new Error('Ответ от API не содержит данных о сделке');
    }
  } catch (error) {
    console.error('Ошибка при создании сделки:', error.message);
    res.status(500).json({ error: 'Ошибка при создании сделки', details: error.message });
  }
});

// ПОЛУЧЕНИЕ СПИСКА СДЕЛОК ЧЕРЕЗ API amoCRM
app.get('/get-deals', async (req, res) => {
  if (!accessToken || !baseDomain) {
    return res.status(400).json({ error: 'Токен или базовый домен не настроены. Сначала выполните /get-token.' });
  }

  try {
    const response = await axios.get(`https://${baseDomain}/api/v4/leads`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    });

    const deals = response.data._embedded.leads.map(deal => ({
      id: deal.id,
      name: deal.name,
      price: deal.price,
      created_at: deal.created_at ? new Date(deal.created_at * 1000).toLocaleString() : 'Не указано',
    }));

    res.json({ message: 'Список сделок успешно получен', deals });
  } catch (error) {
    console.error('Ошибка при получении сделок:', error.message);
    res.status(500).json({ error: 'Не удалось получить список сделок', details: error.response?.data || error.message });
  }
});


// ПОЛУЧЕНИЕ СПИСКА КОМПАНИИ   ЧЕРЕЗ API amoCRM
app.get('/get-companies', async (req, res) => {
  if (!accessToken || !baseDomain) {
    return res.status(400).json({ error: 'Токен или базовый домен не настроены. Сначала выполните /get-token.' });
  }

  try {
    const response = await axios.get(`https://${baseDomain}/api/v4/companies`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    });

    const companies = response.data._embedded.companies.map(company => ({
      id: company.id,
      name: company.name
    }));

    res.json({ message: 'Список компании успешно получен', companies });
  } catch (error) {
    console.error('Ошибка при получении компании:', error.message);
    res.status(500).json({ error: 'Не удалось получить список компании', details: error.response?.data || error.message });
  }
});

// ПОЛУЧЕНИЕ СПИСКА КОНТАТКОВ  ЧЕРЕЗ API amoCRM
app.get('/get-contacts', async (req, res) => {
  if (!accessToken || !baseDomain) {
    return res.status(400).json({ error: 'Токен или базовый домен не настроены. Сначала выполните /get-token.' });
  }

  try {
    const response = await axios.get(`https://${baseDomain}/api/v4/contacts`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    });

    const contacts = response.data._embedded.contacts.map(contact => ({
      id: contact.id,
      name: contact.name,
      first_name: contact.first_name,
      last_name: contact.last_name
    }));

    res.json({ message: 'Список контактов успешно получен', contacts });
  } catch (error) {
    console.error('Ошибка при получении контактов:', error.message);
    res.status(500).json({ error: 'Не удалось получить список контактов', details: error.response?.data || error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Сервер запущен на http://localhost:${PORT}`);
});
