import axios from 'axios'
import YAML from 'yamljs'
import fs from 'fs'
import path from 'path'
import querystring from 'querystring'

const http = axios.create({
	baseURL: 'https://adventure.land/',
	headers: {
		'content-type': 'application/x-www-form-urlencoded'
	}
})

export default function upload(opts = {}) {
	return {
		name: 'upload',
		async generateBundle(opts, bundle, isWrite) {
			const config = YAML.parse(fs.readFileSync('./config.yml', 'utf8'))
			await login(config.auth.email, config.auth.password)
			let slot = +config.startSlot || 1
			for (const file in bundle) {
				const { name } = path.parse(file)
				const res = await saveCode(slot++, name, fs.readFileSync('dist/' + file, 'utf8'))
				res.forEach(ev => console.log(ev.message))
			}
		}
	}
}

async function apiCall(method, args) {
	const payload = querystring.stringify({ method, arguments: JSON.stringify(args) })
	console.log(payload)
	return http.post(`/api/${method}`, payload)
}

async function login(email, password) {
	const { data, headers: { 'set-cookie': cookies }, request } = await apiCall('signup_or_login', { email, password, only_login: true })
	const authCookie = cookies.find(c => c.startsWith('auth'))
	const [,auth] = authCookie.match(/(auth=.+?);/)
	http.defaults.headers.common.cookie = auth
	return data
}

async function saveCode(slot, name, code) {
	const { data } = await apiCall('save_code', { slot, name, code, log: 1 })
	return data
}