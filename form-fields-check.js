export const formcorrector = new class FORMCORRECTOR
{

	constructor () {

		this.formanalyzer()

	}

	formanalyzer() {

		window.addEventListener('dblclick', ev => { if( ['a','button'].indexOf(ev.target.tagName.toLowerCase())>-1 ||  ev.target.getAttribute('type') == 'submit' ){ ev.preventDefault(); alert('Il doppio click non è consetito'); }} , false)

	   	//// before start chesck:
	   	//// in case of variants make check for all form and save error
	   	//// in an array. else, is form by form.

	   	var globalstatus = []

	   	//// now you can start normally...

		// loops all via command
		document.onkeydown = KeyboardEvent => {

			if ( KeyboardEvent.key=="Enter" || (KeyboardEvent.ctrlKey==true&&KeyboardEvent.altKey==true&&KeyboardEvent.key=="f") )
			for ( let form of document.forms ) if ( form.submit ) { checkfields(form,false) }

		}

		// loop via submit
		for ( let form of document.forms ) {

			let btn = form.querySelectorAll("input[type=submit]")[0]

			if(btn) {

				btn.style.zIndex="-1"
				btn.setAttribute('disabled',true)
				let ishover = false; btn.parentElement.addEventListener('mouseenter', () => { ishover=true; btn.parentElement.addEventListener('mouseleave', () => { ishover=false },true) },true)
				document.addEventListener('mouseup', ev => { if(ishover){ checkfields(form,true) } } , false)  ;

			}

		}

		// check fileds
		function checkfields(form,isClick) {

			let btnsubmit = document.querySelectorAll('*[type=submit]').length ?
					document.querySelectorAll('*[type=submit]')[document.querySelectorAll('*[type=submit]').length-1] :
					false

			if ( btnsubmit ) {

				btnsubmit.disabled=true
				btnsubmit.style.zIndex = '-1'
				btnsubmit.style.opacity = '.5'
				btnsubmit.value="CONTROLLO IN CORSO"

				let formstatus = [],
					fields = form.querySelectorAll('input'),
					isit = (field,subject) => field.classList.contains(subject),
					istype = (field,subject) => field.getAttribute('type') === subject ? true : false


				//base correction
				for (let i=0;i<fields.length;i++) {

					let field = fields[i]

					if( istype(field,'text') && !isit(field,'tags') ) {


						let value = field.value.replace(/^\s+|\s+$/gm,'')

						field.setAttribute('value', value)
						field.value = value


					} else if( istype(field,'password') ) {


						let value = field.value.replace(/^\s+|\s+$/gm,'')

						field.setAttribute('value', value)
						field.value = value

						if ( field.previousElementSibling ) {

							field.previousElementSibling.value = value
							field.previousElementSibling.setAttribute('value', value)

						}


					} else if ( isit(field,'nocheck') && istype(field,'date') ) {


						field.previousElementSibling.setAttribute('value', field.value);
						field.previousElementSibling.value = field.value;

					}


					if ( isit(field,'tags') ) {

						setTimeout(()=>{

							let cleanedtag = field.value.toLowerCase()
										.replace(/\"/g,'')
										.replace(/\'/g,'')
										.replace(/;/g,',')
										.replace(/-/g,',')
										.replace(/\s/g,',')
										.replace(/,,/g,'')
										.replace(/,\s*$/,'')
										.replace(/,*$/, '')

							// field.value = cleanedtags
							field.setAttribute('value',cleanedtag)
							field.value = cleanedtag

						},50)

					}

					if ( field.name === 'price' ) {

						if ( field.value.indexOf(",")>-1 ) {

							field.setAttribute('value', field.value.replace(/\,/gi,'.') )
							field.value = field.value.replace(/\,/gi,'.')

						}

						if ( field.value.split('\.').length<=1) {

							field.value=field.value+'.0'

						}

						if ( field.value=='0.0' ) { 

							alert('Attenzione: il prezzo impostato a zero generà un errore. Seexor non prevede prodotti gratuiti')

						}

					}

					if( istype(field,'url') ) {

						if ( !field.value.match('http') && field.value != '' ) { 

							field.value = 'https://'+field.value
							field.setAttribute('value', 'https://'+field.value )

						}
					
					}

					if ( istype(field,'tel') ) {

						field.value = field.value.replace(/[\s\-\(\)]/g,'')
						field.setAttribute('value', field.value.replace(/[\s\-\(\)]/g,'') )
						console.log("TEL VALUE CORRECTION",field.value)

					}

				}

				//check required
				for (let i=0;i<fields.length;i++) {


					let field = fields[i]


					//details custom check
					if ( field.parentNode.classList.contains("detailkey")||field.parentNode.classList.contains("detailvalue") ) {


						let e

						for (let char of ['{','}','[',']','"',',',':']) if( field.value.indexOf(char)>-1 )e=true

						if ( e||field.value=='' ) { 

							formstatus.push("fail")
							globalstatus.push("fail")
							globalstatus.push('fail')
							field.classList.add('border-error')

						} else { 

							field.classList.remove('border-error')

						}


					}


					if ( isit(field,'[required]') ) {


						let pattern		= field.getAttribute('data-pattern') ? new RegExp(field.getAttribute('data-pattern')) : false,
							empty64 	= 'PHA+PGJyPjwvcD4=',
							validity	= true;

						const isEmpty = fieldval => fieldval == (field.getAttribute('placeholder')||"...") || fieldval=='' || !fieldval || fieldval==empty64   ? true : false

						if( istype(field,'hidden') || istype(field,'text') || field.className.toLowerCase()=='textarea') {


							if( !isEmpty(field.value) && !pattern )
								validity = /^([a-z0-9A-Z]|à|è|ì|ò|ù|À|È|Ì|Ò|Ù|á|é|í|ó|ú|ý|Á|É|Í|Ó|Ú|Ý|£|%|&|#|:|;|,|\.|\!|\?|\$|\_|\-|\=|\+|\*|\^|\'|\"|\Ø|\(|\)|\{|\}|\[|\]|\\|\/|\||\s)+$/g.test(field.value) ? true : false
						
						
						} else if( istype(field,'password') ) {
						
						
							// see more = https://stackoverflow.com/questions/19605150/regex-for-password-must-contain-at-least-eight-characters-at-least-one-number-a
							if ( !isEmpty(field.value) && !pattern )
								validity = /^(\w{6})([a-z0-9A-Z]|%|&|#|\.|\!|\?|\$|\_|\-|\=|\*|\(|\)|\{|\}|\[|\]|\\|\/)*$/g.test(field.value) ? true : false
						
						
						} else if ( istype(field,'email') ) {
						
							//|| !field.value.match('@') && !field.value.match('.')
							if ( !isEmpty(field.value) && ! pattern )
								validity = /^\w{3,64}+([\.-]?)*@\w{3,254}+([\.-]?\w+)*(\.\w{2,3})+$/.test(field.value) ? true : false
						
						
						} else if ( istype(field,'url') ) {


							if ( !isEmpty(field.value) && !pattern && !field.value.match('http') && !field.value.match('.') )
								validity = /https?:\/\/(www\.)?[a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([a-zA-Z0-9()@:%_\+.~#?&//=]*)/.test(field.value) ? true : false

						
						} else if ( istype(field,'number') ) {


							if( !isEmpty(field.value) && !pattern )
								validity = /^[0-9]+$/.test(field.value) ? true : false


						} else if ( istype(field,'tel') ) {

							if( !isEmpty(field.value) && !pattern )
								validity = /^[0-9+]+$/.test(field.value) ? true : false

						} else if(istype(field,'checkbox')) {


							validity = field.checked


						} else if(istype(field,'file')) {


							validity = ! field.files.length ? false : true


						} else if ( istype(field,'radio') ) {


							// che all name of radio, for all name...
							validity = (()=>{
								let options = form.querySelectorAll('input[type=radio][name='+field.name+']')
								for (let r of options) if(r.checked) return true
							})()


						}


						if( !validity ) {


							field.parentNode.classList.add('[R-FAIL]','border-error')
							field.parentNode.classList.remove('[R]','border-pass')
							formstatus.push("fail"); globalstatus.push("fail")


						} else {


							field.parentNode.classList.add('[R]','border-pass')
							field.parentNode.classList.remove('[R-FAIL]','border-error')
							formstatus.push("pass")


						}

					}


					if ( i==fields.length-1 ) {

						if ( form==document.forms[document.forms.length-1] ) {

							if( !globalstatus.includes('fail') ) {

								btnsubmit.removeAttribute("disabled")
								btnsubmit.style.zIndex="100"
								btnsubmit.style.opacity = '1'
								btnsubmit.value=btnsubmit.placeholder
								if(isClick) btnsubmit.click()

							} else {

								btnsubmit.value = "ERROR FOUND IN FORM"

							}

						}

						else if ( formstatus.indexOf("fail")>=0 ) {

							btnsubmit.value = "ERROR FOUND IN FORM"

						} else {

							btnsubmit.removeAttribute("disabled")
							btnsubmit.style.zIndex="100"
							btnsubmit.style.opacity = '1'
							btnsubmit.value=btnsubmit.placeholder

							if(isClick) btnsubmit.click()

						}

						globalstatus = []

					}

				}

			}

		}


	}

}
