'use strict'

import Parse from 'parse'
import ParseReact from 'parse-react';
import React from 'react'
import moment from 'moment'
import DatePicker from 'react-datepicker'

require('react-datepicker/dist/react-datepicker.css');

import CommonQuery from '../../queries/CommonQuery'
import Title from '../template/Title'
import { m } from '../../helper'

var ParseComponent = ParseReact.Component(React);

const styles = {
    container: {
        background: "#f2faff",
        paddingTop: "25px"
    },
    title: {
        fontSize: "2em",
        fontWeight: "bold"
    },
    content: {
        paddingTop: "25px",
        paddingBottom: "25px"
    },
    entry: {
        paddingBottom: "10px"
    }
}

class ReviewInputRow extends React.Component {
    render() {
        const styles = {
            title: {
                fontWeight: 900,
                textTransform: "uppercase",
                color: "#88bcb4",
                padding: "8px"
            }
        }
        return (
            <div className="row">
                <div className="small-12 medium-4 columns">
                    <h6 style={styles.title}>{this.props.title}</h6>
                </div>
                <div style={{ paddingBottom: "4px" }} className="small-12 medium-8 columns">
                    {this.props.children}
                </div>
            </div>
        )
    }
}

class ReviewAdd extends ParseComponent {

    constructor(props) {
        super(props);
        this.state = {
            province: props.params.provinceId ? props.params.provinceId : "",
            isAnon: true,
            isAgree: false,
            date: moment()
        }

        CommonQuery.getProvinceNames().find().then((list) => {
            this.state.provinces = list;
        })
        CommonQuery.getServiceNames().find().then((list) => {
            this.state.services = list;
        })
    }

    _onChange(e) {
        let newState = {};
        newState[e.target.id] = e.target.value;
        this.setState(newState);
    }

    _onChangeDate(date, moment, e) {
        let newState = {};
        newState['date'] = date;
        this.setState(newState);
    }

    _onClick(e) {
        e.preventDefault();

        if (this.state.isAgree) {

            let errorState = false;
            if (!this.state.city) {
                this.setState({cityError: true});
            } else {
                this.setState({cityError: false});
            }

            if (!this.state.service) {
                this.setState({serviceError: true});
            } else {
                this.setState({serviceError: false});
            }

            if (errorState) {
                return
            }

            var newReview = {
                city: {
                    "__type": "Pointer",
                    "className": "City",
                    "objectId": this.state.city
                },
                service: {
                    "__type": "Pointer",
                    "className": "Service",
                    "objectId": this.state.service
                },
                rating: Number(this.state.rating),
                title: this.state.title,
                content: this.state.content,
                fee: Number(this.state.fee),
                duration: Number(this.state.duration),
                date: this.state.date
            }
            if (!this.state.isAnon) {
                newReview["name"] = this.state.name;
                newReview["phone"] = this.state.phone;
                newReview["email"] = this.state.email;
            }
            ParseReact.Mutation.Create('Review', newReview).dispatch().then(()=> {
                alert('Terima kasih atas ulasan anda');

                this.setState({
                    province: "",
                    city: "",
                    service: "",
                    rating: "",
                    title: "",
                    content: "",
                    fee: "",
                    duration: "",
                    date: "",
                    name: "",
                    phone: "",
                    email: "",
                });

            })
            return false
        }

        else {
            // TODO
            return false;
        }
    }

    observe(props, states) {

        // selected province
        let province = undefined;
        if (states.province)
            province = {
                "__type": "Pointer",
                "className": "Province",
                "objectId": states.province
            };

        return {
            cities: CommonQuery.getCityNamesByProvince(province)
        }
    }

    render() {

        const {
            province,
            provinces,
            city,
            cityError,
            serviceError,
            services
            } = this.state

        const selectionStyles = {
            text: {
                color: '#7385A2',
                textTransform: 'uppercase',
                fontWeight: 900,
                fontSize: '0.9em',
                letterSpacing: '1px'
            },
            select: {
                backgroundColor: "inherit",
                border: "none",
                marginBottom: "1em",
                cursor: "pointer"
            }
        }
        let locationSelection = (
            <div className="row" style={{ marginTop: "0.6em" }}>
                <div className="small-12 medium-2 large-1 columns hide-for-small-only">
                    <label
                        style={m(selectionStyles.text, { marginLeft: "8px", paddingTop: "0.5rem", marginTop: "-1px" })}>
                        Untuk:
                    </label>
                </div>

                <div className="small-10 medium-4 large-3 columns">
                    <select id="province" value={province}
                            onChange={this._onChange.bind(this)}
                            style={m(selectionStyles.text, selectionStyles.select)} required>

                        <option key="" value="">Pilih Propinsi</option>
                        { !provinces ? undefined : provinces.map((e)=> {
                            return <option key={e.id} value={e.id}>{e.get('name')}</option>
                        })}

                    </select>
                </div>
                <div className="small-10 medium-4 large-3 columns">
                    {cityError ? <small className="error">Kota harus di isi</small> : <span />}
                    <select id="city" value={city}
                            onChange={this._onChange.bind(this)}
                            style={m(selectionStyles.text, selectionStyles.select)} required>

                        <option key="" value="">Pilih Kota</option>
                        { this.data.cities.map((e) => {
                            return <option key={e.objectId} value={e.objectId}>{e.name}</option>
                        })}

                    </select>
                </div>
            </div>
        )

        let serviceInput = (
            <ReviewInputRow title="Layanan">
                { serviceError ? <small className="error">Jenis layanan harus di isi</small> : <span />}
                <select id="service" value={this.state.service} onChange={this._onChange.bind(this)} required>
                    <option key="" value="">Pilih Layanan</option>
                    { !services ? undefined : this.state.services.map((e) => {
                        return <option key={e.id} value={e.id}>{e.get('name')}</option>
                    })}
                </select>
            </ReviewInputRow>
        )

        let titleInput = (
            <ReviewInputRow title="Judul Ulasan">
                <input
                    type="text" value={this.state.title}
                    id="title" onChange={this._onChange.bind(this)} required/>
            </ReviewInputRow>
        )

        let ratingInput = (
            <ReviewInputRow title="Rating">
                <input
                    type="number" min="1" max="5"
                    value={this.state.rating} id="rating"
                    onChange={this._onChange.bind(this)} required/>
            </ReviewInputRow>
        )

        let contentInput = (
            <ReviewInputRow title="Isi Ulasan">
                <textarea
                    rows="5" value={this.state.content} className="form-control" id="content"
                    onChange={this._onChange.bind(this)}/>
            </ReviewInputRow>
        )

        // optional content
        let feeInput = (
            <ReviewInputRow title="Biaya">
                <input
                    type="number" min="0" value={this.state.fee}
                    id="fee" onChange={this._onChange.bind(this)}/>
            </ReviewInputRow>
        )

        let durationInput = (
            <ReviewInputRow title="Durasi Pelayanan (Hari)">
                <input
                    type="number" min="0" value={this.state.duration}
                    id="duration" onChange={this._onChange.bind(this)}/>
            </ReviewInputRow>
        )

        let dateInput = (
            <ReviewInputRow title="Tanggal Kejadian">
                <DatePicker
                    selected={this.state.date}
                    maxDate={moment()}
                    minDate={moment().subtract(1, 'year')}
                    onChange={this._onChangeDate.bind(this)}/>
            </ReviewInputRow>
        )

        let isAnonInput = (
            <div className="row">
                <div className="large-9 large-offset-3 columns">
                    <label>
                        <input
                            checked={this.state.isAnon} type="checkbox" id="isAnon"
                            onChange={(e)=>{this.setState({isAnon:e.target.checked})}}/>
                        Saya mau mengirim ulasan secara anonim
                    </label>
                </div>
            </div>
        )

        let identitasInput = [];
        if (!this.state.isAnon) {
            let nameInput = (
                <ReviewInputRow title="Name">
                    <input
                        value={this.state.name} required type="text" placeholder="Name" id="name"
                        onChange={this._onChange.bind(this)}/>
                </ReviewInputRow>
            )
            let phoneInput = (
                <ReviewInputRow title="Telepon">
                    <input
                        value={this.state.phone} required type="text" placeholder="Telepon" id="phone"
                        onChange={this._onChange.bind(this)}/>
                </ReviewInputRow>
            )

            let emailInput = (
                <ReviewInputRow title="Email">
                    <input
                        value={this.state.email} required type="email" placeholder="Email" id="email"
                        onChange={this._onChange.bind(this)}/>
                </ReviewInputRow>
            )

            identitasInput.push(nameInput);
            identitasInput.push(phoneInput);
            identitasInput.push(emailInput);
        }

        let isAgreeInput = (
            <div className="row">
                <div className="large-9 large-offset-3 columns">
                    <label>
                        <input
                            required type="checkbox" id="isAgree"
                            onChange={ (e) => { this.setState({isAgree:e.target.checked}) } }/>
                        Saya menyetujui syarat dan ketentuan berlaku
                    </label>
                </div>
            </div>
        )

        const submitStyles = {
            button: {
                marginTop: "1em",
                fontWeight: 900
            },
            icon: {
                marginRight: "14px"
            }
        }
        let sendButton = (
            <div className="row">
                <div className="small-12 columns">
                    <button style={submitStyles.button} className="button large success" type="submit">
                        <img style={submitStyles.icon} src="img/icon-submit-review.png"/>
                        Kirim Ulasan
                    </button>
                </div>
            </div>
        )

        return (
            <div>
                <section style={styles.container}>
                    <Title
                        text="Tulis Ulasan"
                        iconPath="img/icon-title-last-reviews.png"
                        color="#2d4771"/>
                    { locationSelection }
                </section>

                <section style={styles.content}>
                    <form onSubmit={this._onClick.bind(this)}>
                        <div className="row align-center">
                            <div className="small-12 large-10 columns">
                                {serviceInput}

                                <hr />

                                {titleInput}
                                {ratingInput}
                                {contentInput}
                                {feeInput}
                                {durationInput}
                                {dateInput}

                                <hr />

                                {isAnonInput}
                                {identitasInput}

                                <hr />

                                {isAgreeInput}
                                {sendButton}

                            </div>
                        </div>
                    </form>
                </section>
            </div>
        );
    }

}
export default ReviewAdd