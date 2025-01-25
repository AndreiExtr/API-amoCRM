<template>
  <div class="app">
    <div class="create">
      <div class="create__dropdown">
        <label for="item-select">Выберите для создания нового элемента:</label>
        <select id="item-select" v-model="selectedItem" @change="onItemSelectChange">
          <option value="none">Не выбрано</option>
          <option value="deal">Сделка</option>
          <option value="contact">Контакт</option>
          <option value="company">Компания</option>
        </select>
      </div>

      <!-- Форма для сделки -->
      <div v-if="isModalVisible" class="modal">
        <div v-if="selectedItem === 'deal'" class="deal-form">
          <div class="deal-form__name">
            <label for="deal-name">Название сделки:</label>
            <input type="text" id="deal-name" v-model="newDeal.name" placeholder="Введите название сделки" />
          </div>

          <div class="deal-form__quantity">
            <label for="deal-price">Цена:</label>
            <input type="number" id="deal-price" v-model="newDeal.price" placeholder="Введите цену сделки" />
          </div>

          <div class="deal-form__bt">
            <button
              class="create__button"
              :class="{ active: isCreateButtonActive }"
              :disabled="!isCreateButtonActive"
              @click="createDeal">
              Создать
            </button>

            <button
              class="cancel__button"
              @click="resetForm">
              Отмена
            </button>
          </div>
        </div>

        <!-- Форма для компании -->
        <div v-else-if="selectedItem === 'company'" class="company-form">
          <div class="form__field">
            <label for="company-name">Название компании:</label>
            <input type="text" id="company-name" v-model="newCompany.name" placeholder="Введите название компании" />
          </div>
          <div class="form__buttons">
            <button class="create__button" :disabled="!newCompany.name" @click="createCompany">
              Создать
            </button>
            <button class="cancel__button" @click="resetForm">Отмена</button>
          </div>
        </div>

        <!-- Форма для контакта -->
        <div v-else-if="selectedItem === 'contact'" class="contact-form">
          <div class="form__field">
            <label for="contact-name">Название контакта:</label>
            <input type="text" id="contact-name" v-model="newContact.name" placeholder="Введите название контакта" />
          </div>
          <div class="form__field">
            <label for="contact-first-name">Имя:</label>
            <input type="text" id="contact-first-name" v-model="newContact.firstName" placeholder="Введите имя" />
          </div>
          <div class="form__field">
            <label for="contact-last-name">Фамилия:</label>
            <input type="text" id="contact-last-name" v-model="newContact.lastName" placeholder="Введите фамилию" />
          </div>
          <div class="form__buttons">
            <button class="create__button" :disabled="!newContact.name || !newContact.firstName || !newContact.lastName" @click="createContact">
              Создать
            </button>
            <button class="cancel__button" @click="resetForm">Отмена</button>
          </div>
        </div>
      </div>
    </div>

    <div class="tabs">
      <button
        v-for="tab in tabs"
        :key="tab.value"
        @click="activeTab = tab.value"
        :class="{ active: activeTab === tab.value }">
        {{ tab.label }}
      </button>
    </div>
    <div class="tab-content">
      <table v-if="activeTab === 'deal'" class="deal-table">
        <thead>
          <tr>
            <th>ID Сделки</th>
            <th>Название</th>
            <th>Цена</th>
            <th>Дата создания</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="deal in deals" :key="deal.id">
            <td>{{ deal.id }}</td>
            <td>{{ deal.name }}</td>
            <td>{{ deal.price }}</td>
            <td>{{ deal.created_at }}</td>
          </tr>
        </tbody>
      </table>
      <table v-else-if="activeTab === 'company'" class="company-table">
        <thead>
          <tr>
            <th>ID Компании</th>
            <th>Название</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="company in companies" :key="company.id">
            <td>{{ company.id }}</td>
            <td>{{ company.name }}</td>
          </tr>
        </tbody>
      </table>
      <table v-else-if="activeTab === 'contact'" class="contact-table">
        <thead>
          <tr>
            <th>ID Контакта</th>
            <th>Название</th>
            <th>Имя</th>
            <th>Фамилия</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="contact in contacts" :key="contact.id">
            <td>{{ contact.id }}</td>
            <td>{{ contact.name }}</td>
            <td>{{ contact.first_name }}</td>
            <td>{{ contact.last_name }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script>
import axios from 'axios'

export default {
  name: 'HomeView',
  data () {
    return {
      baseDomain: process.env.VUE_APP_DOMAIN,
      accessToken: process.env.VUE_APP_ACCESS_TOKEN,
      isModalVisible: true,
      selectedItem: 'none',
      newDeal: {
        name: '',
        price: null
      },
      newCompany: {
        name: ''
      },
      newContact: {
        name: '',
        firstName: '',
        lastName: ''
      },
      tabs: [
        { value: 'deal', label: 'Сделки' },
        { value: 'company', label: 'Компании' },
        { value: 'contact', label: 'Контакты' }
      ],
      activeTab: 'deal',
      deals: [],
      companies: [],
      contacts: []
    }
  },
  computed: {
    isCreateButtonActive () {
      if (this.selectedItem === 'deal') {
        return this.newDeal.name && this.newDeal.price > 0
      }
      return this.selectedItem !== 'none'
    }
  },
  watch: {
    activeTab (newTab) {
      this.handleTabChange(newTab)
      // Сохраняется текущая вкладка в sessionStorage
      sessionStorage.setItem('activeTab', newTab)
    }
  },
  mounted () {
    // Проверка, есть ли сохранённая вкладка в sessionStorage
    const savedTab = sessionStorage.getItem('activeTab')
    if (savedTab && this.tabs.some(tab => tab.value === savedTab)) {
      this.activeTab = savedTab
    } else {
      // Если сохранённой вкладки нет, то устанавливается первая вкладка как активная
      this.activeTab = this.tabs[0].value
    }
    this.handleTabChange(this.activeTab)
  },
  methods: {
    async createCompany () {
      console.log('Отправляемая информация:', this.newCompany)
      try {
        const response = await axios.post('http://localhost:3000/create-company', this.newCompany, {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${this.accessToken}`
          }
        })

        if (response.data.createdCompany) {
          console.log('Добавляем новую компанию:', response.data.createdCompany)

          this.companies.push({
            id: response.data.createdCompany.id,
            name: this.newCompany.name
          })

          console.log('Обновленный список компаний:', this.companies)

          this.isModalVisible = false
        }
      } catch (error) {
        console.error('Ошибка при добавлении компании:', error)
      }
    },
    async createDeal () {
      try {
        const response = await axios.post('http://localhost:3000/create-deal', this.newDeal, {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${this.accessToken}`
          }
        })
        console.log('Ответ от сервера:', response.data)

        if (response.data.createdDeal) {
          this.deals.push({
            id: response.data.createdDeal.id,
            name: this.newDeal.name,
            price: this.newDeal.price,
            created_at: new Date().toLocaleString()
          })

          this.isModalVisible = false
        }
      } catch (error) {
        console.error('Ошибка при создании сделки:', error)
        if (error.response) {
          console.error('Ответ от сервера:', error.response.data)
        } else {
          console.error('Ошибка сети или сервера')
        }
      }
    },
    async handleTabChange (newTab) {
      if (newTab === 'deal') {
        await this.getToken()

        try {
          const response = await fetch('http://localhost:3000/get-deals')
          const data = await response.json()

          if (data.deals) {
            this.deals = data.deals
          } else {
            console.error('Ошибка:', data.error || 'Не удалось загрузить сделки')
          }
        } catch (error) {
          console.error('Ошибка при загрузке сделок:', error)
        }
      } else if (newTab === 'company') {
        await this.fetchCompanies()
      } else if (newTab === 'contact') {
        await this.fetchContacts()
      }
    },
    async fetchCompanies () {
      await this.getToken()
      try {
        const response = await fetch('http://localhost:3000/get-companies')
        const data = await response.json()

        if (data.companies) {
          this.companies = data.companies
        } else {
          console.error('Ошибка:', data.error || 'Не удалось загрузить компании')
        }
      } catch (error) {
        console.error('Ошибка при загрузке компаний:', error)
      }
    },
    async fetchContacts () {
      await this.getToken()
      try {
        const response = await fetch('http://localhost:3000/get-contacts')
        const data = await response.json()

        if (data.contacts) {
          this.contacts = data.contacts
        } else {
          console.error('Ошибка:', data.error || 'Не удалось загрузить контакты')
        }
      } catch (error) {
        console.error('Ошибка при загрузке контакты:', error)
      }
    },
    async getToken () {
      try {
        const response = await fetch('http://localhost:3000/get-token')
        const data = await response.json()

        if (data.access_token && data.base_domain) {
          console.log('Токен и домен успешно получены')
        } else {
          console.error('Не удалось получить токен и домен')
        }
      } catch (error) {
        console.error('Ошибка при получении токена:', error)
      }
    },
    resetForm () {
      this.newDeal = { name: '', price: null }
      this.newCompany = { name: '' }
      this.newContact = { name: '', firstName: '', lastName: '' }
      this.selectedItem = 'none'
    }
  }
}
</script>

<style lang="scss">
.app {
  font-weight: 500;
  margin: 12px;

  .create{
    display: flex;
    flex-direction: row;
    gap: 24px;
    align-items: center;
    position: relative;

    &__dropdown {
      display: flex;
      flex-direction: row;
      align-items: center;
      gap: 8px;

      select{
        width: 300px;
        height: 38px;
        padding: 0 8px;
        border: solid 1px #bdbdbd;
      }
    }

    .modal{
      position: absolute;
      top: 20px;

      .deal-form{
        width: 350px;
        height: auto;
        background-color: #ffffff;
        border: solid 1px #ddd;
        border-radius: 3px;
        display: flex;
        gap: 16px;
        flex-direction: column;
        align-items: flex-start;
        padding: 8px;
        box-shadow: 0 4px 6px rgba(5, 5, 5, 0.3);

        &__name{
          text-align: left;
          width: 100%;
        }

        &__quantity{
          text-align: left;
          width: 100%;
        }

        &__bt{
          width: 100%;
          display: flex;
          flex-direction: row;
          justify-content: flex-end;
          gap: 24px;

          .cancel__button {
            background-color: #f44336;
            color: white;
            padding: 10px 20px;
            border: none;
            border-radius: 5px;
            cursor: pointer;
            margin-left: 10px;

            &:hover{
              background-color: #e53935;
            }
          }

          .create__button {
            padding: 10px 20px;
            border: none;
            border-radius: 4px;
            font-size: 16px;
            cursor: pointer;
            background-color: green;
            color: rgb(255, 255, 255);
            transition: background-color 0.3s, color 0.3s;

            &:hover {
              background-color: rgb(0, 105, 0);
              color: white;
            }

            &:active {
              background-color: rgb(0, 65, 0);
              color: white;
            }

            &:disabled {
              background-color: rgb(236, 236, 236);
              color: rgb(179, 179, 179);
              cursor: not-allowed;
            }
          }
        }

        input{
          width: 100%;
          height: 32px;
          border: solid 1px #ddd;
          padding: 0 4px;
        }
      }

      .company-form{
        width: 350px;
        height: auto;
        background-color: #ffffff;
        border: solid 1px #ddd;
        border-radius: 3px;
        display: flex;
        gap: 16px;
        flex-direction: column;
        align-items: flex-start;
        padding: 8px;
        box-shadow: 0 4px 6px rgba(5, 5, 5, 0.3);

        .form__field{
          text-align: left;
          width: 100%;
        }

        &__quantity{
          text-align: left;
          width: 100%;
        }

        .form__buttons{
          width: 100%;
          display: flex;
          flex-direction: row;
          justify-content: flex-end;
          gap: 24px;

          .cancel__button {
            background-color: #f44336;
            color: white;
            padding: 10px 20px;
            border: none;
            border-radius: 5px;
            cursor: pointer;
            margin-left: 10px;

            &:hover{
              background-color: #e53935;
            }
          }

          .create__button {
            padding: 10px 20px;
            border: none;
            border-radius: 4px;
            font-size: 16px;
            cursor: pointer;
            background-color: green;
            color: rgb(255, 255, 255);
            transition: background-color 0.3s, color 0.3s;

            &:hover {
              background-color: rgb(0, 105, 0);
              color: white;
            }

            &:active {
              background-color: rgb(0, 65, 0);
              color: white;
            }

            &:disabled {
              background-color: rgb(236, 236, 236);
              color: rgb(179, 179, 179);
              cursor: not-allowed;
            }
          }
        }

        input{
          width: 100%;
          height: 32px;
          border: solid 1px #ddd;
          padding: 0 4px;
        }
      }

      .contact-form{
        width: 350px;
        height: auto;
        background-color: #ffffff;
        border: solid 1px #ddd;
        border-radius: 3px;
        display: flex;
        gap: 16px;
        flex-direction: column;
        align-items: flex-start;
        padding: 8px;
        box-shadow: 0 4px 6px rgba(5, 5, 5, 0.3);

        .form__field{
          text-align: left;
          width: 100%;
        }

        &__quantity{
          text-align: left;
          width: 100%;
        }

        .form__buttons{
          width: 100%;
          display: flex;
          flex-direction: row;
          justify-content: flex-end;
          gap: 24px;

          .cancel__button {
            background-color: #f44336;
            color: white;
            padding: 10px 20px;
            border: none;
            border-radius: 5px;
            cursor: pointer;
            margin-left: 10px;

            &:hover{
              background-color: #e53935;
            }
          }

          .create__button {
            padding: 10px 20px;
            border: none;
            border-radius: 4px;
            font-size: 16px;
            cursor: pointer;
            background-color: green;
            color: rgb(255, 255, 255);
            transition: background-color 0.3s, color 0.3s;

            &:hover {
              background-color: rgb(0, 105, 0);
              color: white;
            }

            &:active {
              background-color: rgb(0, 65, 0);
              color: white;
            }

            &:disabled {
              background-color: rgb(236, 236, 236);
              color: rgb(179, 179, 179);
              cursor: not-allowed;
            }
          }
        }

        input{
          width: 100%;
          height: 32px;
          border: solid 1px #ddd;
          padding: 0 4px;
        }
      }
    }
  }

  .tabs {
    margin: 20px 0;
    display: flex;
    flex-direction: row;

    button {
      margin-right: 10px;
      padding: 10px 20px;
      border: none;
      border-radius: 4px;
      font-size: 16px;
      cursor: pointer;
      background-color: rgb(236, 236, 236);
      color: rgb(179, 179, 179);
      transition: background-color 0.3s;

      &.active {
        background-color: blue;
        color: white;
      }
    }
  }

  .tab-content {
    margin-top: 20px;
    font-size: 16px;

    .deal-table,
    .company-table,
    .contact-table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 20px;

      th, td {
        padding: 10px;
        text-align: left;
        border: 1px solid #ddd;
      }

      th {
        background-color: #f4f4f4;
      }

      tr{
        &:hover{
          background-color: #f4f4f4;
        }
      }
    }
  }
}
</style>
