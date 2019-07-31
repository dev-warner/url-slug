const expect = require('chai').expect
const urlSlug = require('../src/index')

describe('module', () => {
  it('includes UrlSlug constructor as a property', () => {
    expect(urlSlug.UrlSlug.constructor)
      .to.be.equal(urlSlug.constructor)
  })

  it('has a convert and a revert method', () => {
    expect(urlSlug.convert)
      .to.be.a('function')
    expect(urlSlug.revert)
      .to.be.a('function')
  })

  it('has builtin transformers', () => {
    expect(urlSlug.transformers)
      .to.be.deep.equal({
        lowercase: urlSlug.UrlSlug.LOWERCASE_TRANSFORMER,
        uppercase: urlSlug.UrlSlug.UPPERCASE_TRANSFORMER,
        titlecase: urlSlug.UrlSlug.TITLECASE_TRANSFORMER,
      })
  })

  it('has a working lowercase transformer', () => {
    expect(urlSlug.transformers.lowercase(['TEST', 'STRING'], ' '))
      .to.be.equal('test string')
  })

  it('has a working uppercase transformer', () => {
    expect(urlSlug.transformers.uppercase(['test', 'string'], ' '))
      .to.be.equal('TEST STRING')
  })

  it('has a working titlecase transformer', () => {
    expect(urlSlug.transformers.titlecase(['tesT', 'strinG'], ' '))
      .to.be.equal('Test String')
  })

  it('calls convert if called as a function', () => {
    expect(urlSlug)
      .to.be.equal(urlSlug.convert)
  })
})

describe('constructor', () => {
  it('contains builtin transformers as static properties', () => {
    expect(urlSlug.UrlSlug.LOWERCASE_TRANSFORMER)
      .to.be.a('function')
    expect(urlSlug.UrlSlug.UPPERCASE_TRANSFORMER)
      .to.be.a('function')
    expect(urlSlug.UrlSlug.TITLECASE_TRANSFORMER)
      .to.be.a('function')
  })

  it('has default options set', () => {
    const instance = new urlSlug.UrlSlug()
    expect(instance.camelCase)
      .to.be.true
    expect(instance.separator)
      .to.be.string('-')
    expect(instance.transformer)
      .to.be.equal(urlSlug.UrlSlug.LOWERCASE_TRANSFORMER)
  })

  it('sets properties with options argument values', () => {
    const transformer = () => {}
    const instance = new urlSlug.UrlSlug({
      camelCase: false,
      separator: '_',
      transformer,
    })
    expect(instance.camelCase)
      .to.be.false
    expect(instance.separator)
      .to.be.string('_')
    expect(instance.transformer)
      .to.be.equal(transformer)
  })
})

describe('validate', () => {
  it('accepts an options object', () => {
    expect(() => new urlSlug.UrlSlug({}))
      .to.not.throw()
  })

  it('accepts only boolean values in camelCase option', () => {
    expect(() => new urlSlug.UrlSlug({ camelCase: true }))
     .to.not.throw()
    expect(() => new urlSlug.UrlSlug({ camelCase: null }))
     .to.throw('camelCase must be a boolean')
  })

  it('accepts an empty string as separator', () => {
    expect(() => new urlSlug.UrlSlug({ separator: '' }))
      .to.not.throw()
  })

  it('accepts only unreserved characters in RFC 3986 as separator', () => {
    expect(() => new urlSlug.UrlSlug({ separator: '-._~' }))
      .to.not.throw()
    expect(() => new urlSlug.UrlSlug({ separator: '+' }))
      .to.throw('separator has invalid characters')
  })

  it('does not accept a separator that is not a string', () => {
    expect(() => new urlSlug.UrlSlug({ separator: 123 }))
      .to.throw('separator must be a string')
  })

  it('accepts false as a transformer', () => {
    expect(() => new urlSlug.UrlSlug({ transformer: false }))
      .to.not.throw()
  })

  it('accepts a function as a transformer', () => {
    expect(() => new urlSlug.UrlSlug({ transformer: () => {} }))
      .to.not.throw()
  })

  it('accepts builtin functions as a transformer', () => {
    const lowercase = urlSlug.UrlSlug.LOWERCASE_TRANSFORMER
    const uppercase = urlSlug.UrlSlug.UPPERCASE_TRANSFORMER
    const titlecase = urlSlug.UrlSlug.TITLECASE_TRANSFORMER
    expect(() => new urlSlug.UrlSlug({ transformer: lowercase }))
      .to.not.throw()
    expect(() => new urlSlug.UrlSlug({ transformer: uppercase }))
      .to.not.throw()
    expect(() => new urlSlug.UrlSlug({ transformer: titlecase }))
      .to.not.throw()
  })

  it('accepts only false or a function as a transformer', () => {
    expect(() => new urlSlug.UrlSlug({ transformer: true }))
      .to.throw('transformer must be a function')
      expect(() => new urlSlug.UrlSlug({ transformer: 'string' }))
      .to.throw('transformer must be a function')
      expect(() => new urlSlug.UrlSlug({ transformer: {} }))
      .to.throw('transformer must be a function')
  })
})

describe('convert', () => {
  it('uses validate to check options', () => {
    expect(() => urlSlug.convert('', { separator: 123 }))
      .to.throw('separator must be a string')
    expect(() => urlSlug.convert('', { camelCase: null }))
      .to.throw('camelCase must be a boolean')
  })

  it('converts input to string', () => {
    expect(urlSlug.convert(123))
      .to.be.equal('123')
  })

  it('uses lowercase transformer and hyphen separator as default', () => {
    expect(urlSlug.convert('Url Slug'))
      .to.be.equal('url-slug')
  })

  it('removes accents', () => {
    expect(urlSlug.convert('á é í ó ú'))
      .to.be.equal('a-e-i-o-u')
  })

  it('uses upper case as transformer and use the default separator', () => {
    expect(urlSlug.convert('a bronx tale', 'uppercase'))
      .to.be.equal('A-BRONX-TALE')
  })

  it('uses underscore as separator and title case as transformer', () => {
    expect(urlSlug.convert('tom jobim', '_', 'titlecase'))
      .to.be.equal('Tom_Jobim')
  })

  it('allows multiple characters as separator and maintains the case', () => {
    expect(urlSlug.convert('Charly García', '-._~-._~', false))
      .to.be.equal('Charly-._~-._~Garcia')
  })

  it('returns a camel case slug', () => {
    expect(urlSlug.convert('java script', '', 'titlecase'))
      .to.be.equal('JavaScript')
  })

  it('splits a camel case string', () => {
    expect(urlSlug.convert('javaScript'))
      .to.be.equal('java-script')
    expect(urlSlug.convert('javaSCRIPT', null, null))
      .to.be.equal('java-SCRIPT')
    expect(urlSlug.convert('JAVAScript', null, null))
      .to.be.equal('JAVA-Script')
    expect(urlSlug.convert('jaVAScriPT', null, null))
      .to.be.equal('ja-VA-Scri-PT')
    expect(urlSlug.convert('JaVaScriPt', null, null))
      .to.be.equal('Ja-Va-Scri-Pt')
    expect(urlSlug.convert('JaVaScrIpT', null, null))
      .to.be.equal('Ja-Va-Scr-Ip-T')
  })

  it('returns only consonants', () => {
    const transform = (fragments, separator) => fragments
      .join(separator)
      .replace(/[aeiou]/gi, '')
    expect(urlSlug.convert('React', '', transform))
      .to.be.equal('Rct')
  })

  it('handles empty strings', () => {
    expect(urlSlug.convert(''))
      .to.be.equal('')
  })

  it('handles strings with no alphanumeric characters', () => {
    expect(urlSlug.convert('- ( ) [ ]'))
      .to.be.equal('')
  })
})

describe('revert', () => {
  it('uses validate to check options', () => {
    expect(() => urlSlug.revert('', { separator: 123 }))
      .to.throw('separator must be a string')
    expect(() => urlSlug.revert('', { camelCase: null }))
      .to.throw('camelCase must be a boolean')
  })

  it('converts input to string', () => {
    expect(urlSlug.revert(123))
      .to.be.equal('123')
  })

  it('uses unknown reversion and maintain input case', () => {
    expect(urlSlug.revert('UrlSlug-_url.~slug'))
      .to.be.equal('Url Slug url slug')
  })

  it('reverts a camel case slug', () => {
    expect(urlSlug.revert('javaScript'))
      .to.be.equal('java Script')
    expect(urlSlug.revert('javaSCRIPT', ''))
      .to.be.equal('java SCRIPT')
    expect(urlSlug.revert('JAVAScript', ''))
      .to.be.equal('JAVA Script')
    expect(urlSlug.revert('jaVAScriPT', ''))
      .to.be.equal('ja VA Scri PT')
    expect(urlSlug.revert('JaVaScriPt', ''))
      .to.be.equal('Ja Va Scri Pt')
    expect(urlSlug.revert('JaVaScrIpT', ''))
      .to.be.equal('Ja Va Scr Ip T')
  })

  it('splits on camel case and convert input to upper case', () => {
    expect(urlSlug.revert('ClaudioBaglioni_is-Italian', '', 'uppercase'))
      .to.be.equal('CLAUDIO BAGLIONI_IS-ITALIAN')
  })

  it('returns the title of a Pink Floyd track', () => {
    expect(urlSlug.revert('comfortably-._~numb', '-._~', 'titlecase'))
      .to.be.equal('Comfortably Numb')
  })

  it('reverts an empty string to another empty string', () => {
    expect(urlSlug.revert(''))
      .to.be.equal('')
  })
})
