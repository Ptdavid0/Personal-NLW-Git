import React, { useState, useEffect , ChangeEvent , FormEvent } from "react";
import "./styles.css";
import { Link,useHistory } from "react-router-dom";
import { FiArrowLeft } from "react-icons/fi";
import logo from "../../assets/logo.svg";
import { Map, Marker, TileLayer } from "react-leaflet";
import { LeafletMouseEvent } from 'leaflet'
import api from "../../services/api";
import axios from "axios";

const CreatePoint: React.FC = () => {
 
  //Interface
  interface Item{
    id:number;
    title:string;
    image_url:string;
  }

  interface IBGEUFResponse{
    sigla:string
  }

  interface IBGEUFCityResponse{
    nome:string
  }
  
  //States
  const [items, setItems] = useState<Item[]>([]);
  const [ufs,setUfs] = useState<string[]>([])
  const [selectedUF,setSelectedUF] = useState('0')
  const [selectedCity,setSelectedCity] = useState('0')
  const [cities,setCities] = useState<string[]>([])
  const [initialPosition,setInitialPosition] = useState<[number,number]>([0,0])
  const [selectedPosition,setSelectedPosition] = useState<[number,number]>([0,0])
  const [formData,setFormData] = useState({
    name:'',
    email:'',
    whatsapp:''
  })
  const [selectedItems,setSelectedItems] = useState<number[]>([])

  const history = useHistory()

  //API Requests
  useEffect(() => {
    api.get("items").then((response) => {
      // console.log(response.data);
      setItems(response.data);
    });
  }, []);

  useEffect(() =>{
    axios.get<IBGEUFResponse[]>("https://servicodados.ibge.gov.br/api/v1/localidades/estados").then(response =>{
      // console.log(response.data);
      const ufInitials = response.data.map(uf => uf.sigla)
      setUfs(ufInitials)
      
    })
  },[])

  useEffect(() => {
    if (selectedUF === '0') {
      return;
    }

    axios.get<IBGEUFCityResponse[]>(`https://servicodados.ibge.gov.br/api/v1/localidades/estados/${selectedUF}/municipios`).then(response =>{
      const cityNames = response.data.map(city => city.nome)
      setCities(cityNames)
    })
  },[selectedUF])

  useEffect(() =>{
    navigator.geolocation.getCurrentPosition(position =>{
      const {latitude , longitude } = position.coords
      setInitialPosition([latitude,longitude])
    })
  },[])

  function handleSelectUF(event:ChangeEvent<HTMLSelectElement>){
    const uf = event.target.value
    setSelectedUF(uf)
  }

  function handleSelectedCity(event:ChangeEvent<HTMLSelectElement>){
    const city = event.target.value
    setSelectedCity(city)
  }

  function handleMapClick(event:LeafletMouseEvent) {
    setSelectedPosition([
      event.latlng.lat,
      event.latlng.lng
    ])
  }

  function handleInputChange(event:ChangeEvent<HTMLInputElement>) {
    console.log(event.target.value)
    const { name , value } = event.target

    setFormData({...formData, [name]:value});
  }

  function handleSelectItem(id:number) {
    const alreadySelected = selectedItems.findIndex(item => item === id)
    
    if(alreadySelected >= 0) {
      const filteredItems = selectedItems.filter(item => item !== id)
      setSelectedItems(filteredItems)
    }
    else setSelectedItems([...selectedItems, id ])  

    console.log(selectedItems)
  }

  async function handleSubmit(event:FormEvent){
    event.preventDefault()
    const {name,email,whatsapp} = formData
    const uf = selectedUF
    const city = selectedCity
    const [latitude , longitude] = selectedPosition
    const items = selectedItems

    const data = {
      name,
      email,
      whatsapp,
      uf,
      city,
      latitude,
      longitude,
      items
    }

    await api.post('/points',data)

    history.push('/success')
    
  }

  //HTML
  return (
    <div id="page-create-point">
      <header>
        <img src={logo} alt="logo" />

        <Link to="/">
          <FiArrowLeft />
          Voltar para Home
        </Link>
      </header>

      <form onSubmit={handleSubmit} >
        <h1>
          Cadastro do <br />
          ponto de coleta
        </h1>

        <fieldset>
          <legend>
            <h2>Dados</h2>
          </legend>

          <div className="field">
            <label htmlFor="name">Nome da Entidade</label>
            <input type="text" name="name" id="name" onChange={handleInputChange}/>
          </div>

          <div className="field-group">
            <div className="field">
              <label htmlFor="email">E-mail</label>
              <input type="email" name="email" id="email" onChange={handleInputChange}/>
            </div>

            <div className="field">
              <label htmlFor="whatsapp">WhatsApp</label>
              <input type="text" name="whatsapp" id="whatsapp" onChange={handleInputChange} />
            </div>
          </div>
        </fieldset>

        <fieldset>
          <legend>
            <h2>Endereço</h2>
            <span>Selecione o endereço no mapa</span>
          </legend>

          <Map center={initialPosition} zoom={15} onClick={handleMapClick}>
            <TileLayer
              attribution='&amp;copy <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            <Marker position={selectedPosition} />
          </Map>

          <div className="field-group">
            <div className="field">
              <label htmlFor="uf">Estado(UF)</label>
              <select name="uf" id="uf" value={selectedUF} onChange={handleSelectUF}>
              <option value="0">Selecione um Estado</option>
              
              {ufs.map(uf => (
                  <option key={uf} value={uf}>{uf}</option>
                ))}

              </select>
            </div>

            <div className="field">
              <label htmlFor="city">Cidade</label>
              <select name="city" id="city" value={selectedCity} onChange={handleSelectedCity}>
              <option value="0">Selecione uma cidade</option>
                {cities.map(city =>(
                  <option key={city} value={city}>{city}</option>
                ))}
              </select>
            </div>
          </div>
        </fieldset>

        <fieldset>
          <legend>
            <h2>ítens de Coleta</h2>
            <span>Selecione um ou mais ítens abaixo mapa</span>
          </legend>

          <ul className="items-grid">
            {items.map((item) => (
              <li 
              key={item.id} 
              onClick={() => handleSelectItem(item.id)} 
              className={selectedItems.includes(item.id) ? 'selected' : ''}>
                <img
                  src={item.image_url}
                  alt={item.title}
                />
                <span>{item.title}</span>
              </li>
            ))}
          </ul>
        </fieldset>

        <button type="submit">Cadastrar ponto de coleta</button>
      </form>
    </div>
  );
};

export default CreatePoint;
