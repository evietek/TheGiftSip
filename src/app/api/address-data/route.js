import { NextResponse } from 'next/server';
import { Country, State, City } from 'country-state-city';

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const type = searchParams.get('type');
    const countryCode = searchParams.get('countryCode');
    const stateCode = searchParams.get('stateCode');

    switch (type) {
      case 'countries':
        const countries = Country.getAllCountries().map(country => ({
          code: country.isoCode,
          name: country.name,
          phonecode: country.phonecode,
          currency: country.currency,
          currencySymbol: country.currencySymbol
        }));
        return NextResponse.json({ countries });

      case 'states':
        if (!countryCode) {
          return NextResponse.json({ error: 'Country code is required' }, { status: 400 });
        }
        const states = State.getStatesOfCountry(countryCode).map(state => ({
          code: state.isoCode,
          name: state.name,
          countryCode: state.countryCode
        }));
        return NextResponse.json({ states });

      case 'cities':
        if (!countryCode) {
          return NextResponse.json({ error: 'Country code is required' }, { status: 400 });
        }
        const cities = City.getCitiesOfCountry(countryCode).map(city => ({
          name: city.name,
          stateCode: city.stateCode,
          countryCode: city.countryCode
        }));
        return NextResponse.json({ cities });

      case 'cities-by-state':
        if (!countryCode || !stateCode) {
          return NextResponse.json({ error: 'Country code and state code are required' }, { status: 400 });
        }
        const citiesByState = City.getCitiesOfState(countryCode, stateCode).map(city => ({
          name: city.name,
          stateCode: city.stateCode,
          countryCode: city.countryCode
        }));
        return NextResponse.json({ cities: citiesByState });

      default:
        return NextResponse.json({ error: 'Invalid type parameter' }, { status: 400 });
    }
  } catch (error) {
    console.error('Address data API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

