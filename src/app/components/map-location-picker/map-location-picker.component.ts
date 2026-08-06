declare const google: any;

import { Component, OnInit, ViewChild, Output, EventEmitter, Input, ChangeDetectorRef, AfterViewInit, OnChanges, SimpleChanges } from '@angular/core';
import { AddressService } from '../../services/address.service';
import { GeolocationService, CurrentLocation } from '../../services/geolocation.service';

@Component({
  selector: 'app-map-location-picker',
  templateUrl: './map-location-picker.component.html',
  styleUrls: ['./map-location-picker.component.scss']
})
export class MapLocationPickerComponent implements OnInit, AfterViewInit, OnChanges {
  @ViewChild('mapContainer') mapContainer: any;
  @Input() isOpen: boolean = false;
  @Output() locationSelected = new EventEmitter<any>();
  @Output() closed = new EventEmitter<void>();
  
  map: any = null;
  marker: any = null;

  searchInput: string = '';
  predictions: any[] = [];
  selectedLocation: any = null;
  isSearching: boolean = false;
  mapLoading: boolean = true;
  mapError: string = '';

  defaultLatitude: number = 22.4719;
  defaultLongitude: number = 88.3666;
  currentLocation: CurrentLocation | null = null;

  constructor(
    private cdr: ChangeDetectorRef,
    private addressService: AddressService,
    private geolocationService: GeolocationService
  ) {}

  ngOnInit() {
    // Initialize with default location from API
    // this.getAddressFromCoordinates(this.defaultLatitude, this.defaultLongitude);
    // Get current location from geolocation service
    this.geolocationService.currentLocation$.subscribe({
      next: (location) => {
        if (location) {
          console.log('current location'+ JSON.stringify(location));
          this.currentLocation = location;
          this.defaultLatitude = location.latitude;
          this.defaultLongitude = location.longitude;
          console.log('Using current location:', location);
        } else {
          console.log('Using default India coordinates');
        }
      }
    });
  }

  ngAfterViewInit() {
    // console.log('ngAfterViewInit-MapLocationPickerComponent initialized. isOpen:', this.isOpen);
    if (this.isOpen && this.mapContainer) {
      this.mapLoading = true;
      this.mapError = '';
      setTimeout(() => {
        this.initMap();
        this.mapLoading = false;
      }, 100);
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    console.log('ngOnChanges-MapLocationPickerComponent initialized. isOpen:', this.isOpen);
    // console.log(changes['isOpen']);
    // if (changes['isOpen'] && this.isOpen && this.mapContainer && !this.map) {
    if(this.isOpen) {
      this.getAddressFromCoordinates(this.defaultLatitude, this.defaultLongitude);
      console.log('before initializing map, isOpen:', this.isOpen);
      this.mapLoading = true;
      setTimeout(() => {
        this.initMap();
        this.mapLoading = false;
      }, 100);
    }
  }

  initMap(): void {
    if (!this.mapContainer) {
      this.mapError = 'Map container not found';
      return;
    }

    try {
      const mapOptions = {
        zoom: 15,
        center: { lat: this.defaultLatitude, lng: this.defaultLongitude },
        mapTypeControl: true,
        fullscreenControl: false,
        streetViewControl: true,
        zoomControl: true
      };

      console.log('Map container:', this.mapContainer.nativeElement);
      this.map = new google.maps.Map(this.mapContainer.nativeElement, mapOptions);

      this.marker = new google.maps.Marker({
        map: this.map,
        position: { lat: this.defaultLatitude, lng: this.defaultLongitude },
        draggable: true,
        title: 'Drag to select location'
      });

      this.map.addListener('click', (event: any) => {
        if (event.latLng) {
          this.placeMarker(event.latLng);
        }
      });

      if (this.marker) {
        this.marker.addListener('dragend', () => {
          const pos = this.marker.getPosition();
          if (pos) {
            this.getAddressFromCoordinates(pos.lat(), pos.lng());
          }
        });
      }
    } catch (error) {
      this.mapError = 'Failed to initialize map: ' + (error as any).message;
      console.error(this.mapError, error);
    }
  }

  // Unified search - handles pincode, area, city
  onSearchChange(): void {
    const input = this.searchInput.trim();

    if (input.length === 0) {
      this.predictions = [];
      return;
    }

    // Check if input is a pincode (5-6 digits)
    const isPincode = /^\d{5,6}$/.test(input);

    if (isPincode) {
      this.searchByPincode(input);
    } else if (input.length >= 3) {
      this.searchByArea(input);
    }
  }

  // Search by pincode via API
  searchByPincode(pincode: string): void {
    this.isSearching = true;
    this.predictions = [];

    this.addressService.searchByPincode(pincode).subscribe({
      next: (response: any) => {
        this.isSearching = false;

        if (response.responseCode == 200 && response.data) {
          // Update map with pincode location
          const location = response.data;
          const suggestedPincode = location.suggestions;
          this.predictions = suggestedPincode.map((item:any) => {
             return {
                place_id: item.placePrediction.placeId,
                main_text:item.placePrediction.structuredFormat.mainText.text,
                secondary_text:item.placePrediction.text.text,
                isError:false
            }
          });
          // console.log(this.predictions);
          // const lat = location.latitude || location.lat; 
          // const lng = location.longitude || location.lng;

          // this.placeMarkerByCoordinates(lat, lng);

          // this.selectedLocation = {
          //   address: location.formatted_address || location.address,
          //   latitude: lat,
          //   longitude: lng,
          //   name: location.name || 'Selected Location',
          //   pincode: pincode
          // };

          // if (this.map) {
          //   this.map.setCenter({ lat, lng });
          //   this.map.setZoom(15);
          // }

          this.cdr.detectChanges();
        } else {
          this.predictions = [{
            description: `Pincode "${pincode}" not found`,
            main_text: 'Not Found',
            secondary_text: response.message || 'Try another pincode or area name',
            isError: true
          }];
        }
      },
      error: (error) => {
        this.isSearching = false;
        console.error('Pincode search error:', error);
        this.predictions = [{
          description: 'Error searching pincode',
          main_text: 'Error',
          secondary_text: error.message || 'Failed to search. Please try again.',
          isError: true
        }];
      }
    });
  }

  // Search by area/city via API
  searchByArea(searchText: string): void {
    this.isSearching = true;

    this.addressService.searchByArea(searchText).subscribe({
      next: (response: any) => {
        this.isSearching = false;
        // console.log(response.responseCode);

        if (response.responseCode == 200 && response.data) {

          const location = response.data;
          const suggestedPincode = location.suggestions;
          this.predictions = suggestedPincode.map((item:any) => {
             return {
                place_id: item.placePrediction.placeId,
                main_text:item.placePrediction.structuredFormat.mainText.text,
                secondary_text:item.placePrediction.text.text,
                isError:false
            }
          });
          // console.log(this.predictions);
          // Convert backend response to predictions format
          // this.predictions = response.data.map((item: any) => ({
          //   description: item.formatted_address || item.address,
          //   main_text: item.main_text || item.name,
          //   secondary_text: item.secondary_text || item.address,
          //   place_id: item.place_id || item.id,
          //   latitude: item.latitude || item.lat,
          //   longitude: item.longitude || item.lng,
          //   formatted_address: item.formatted_address || item.address,
          //   name: item.name
          // }));
        } else {
          this.predictions = [];
        }
        this.cdr.detectChanges();
      },
      error: (error) => {
        this.isSearching = false;
        console.error('Area search error:', error);
        this.predictions = [];
      }
    });
  }

  selectPrediction(prediction: any): void {
    // Skip if it's an error prediction
    console.log('Selected prediction:', prediction);
    if (prediction.isError) {
      return;
    }

    this.searchInput = prediction.description;
    this.predictions = [];

    // If we already have coordinates from the search response, use them
    if (prediction.latitude && prediction.longitude) {
      this.placeMarkerByCoordinates(prediction.latitude, prediction.longitude);
      let custom_formatted_address = prediction.addressComponents.filter(
        (component: any) => {
          const hasLocalityType = component.types.includes('locality');
          const hasStateType = component.types.includes('administrative_area_level_1');
          const hasCountryType = component.types.includes('country');
          return hasLocalityType || hasStateType || hasCountryType;
        }
      ).map((comp: any) => comp.longText).join(', ');
      console.log('custom_formatted_address:', custom_formatted_address);
      this.selectedLocation = {
        address: prediction.formatted_address || custom_formatted_address,
        formatted_address: prediction.formatted_address || custom_formatted_address,
        latitude: prediction.latitude,
        longitude: prediction.longitude,
        name: prediction.name || 'Selected Location'
      };

      if (this.map) {
        this.map.setCenter({
          lat: prediction.latitude,
          lng: prediction.longitude
        });
      }

      this.cdr.detectChanges();
    } else {
      // Otherwise, get place details from API
      this.getPlaceDetails(prediction.place_id);
    }
  }

  // Get place details via API
  getPlaceDetails(placeId: string): void {
    this.addressService.getPlaceDetails(placeId).subscribe({
      next: (response: any) => {
        // console.log('Place details response:', response);
        if (response.responseCode == 200 && response.data) {
          const place = response.data;
          // const address = place.formattedAddress;
          // const lat = place.location.latitude;
          // const lng = place.location.longitude;

          // this.placeMarkerByCoordinates(lat, lng);

          // this.selectedLocation = {
          //   address: address,
          //   latitude: lat,
          //   longitude: lng,
          //   name: place.displayName.text || 'Selected Location'
          // };
          let addressComponents:any[] = place.addressComponents;
          // console.log("addressComponents",addressComponents);
          let pincode = addressComponents.find(comp => comp.types.includes('postal_code'))?.longText || '';
          let street_number = addressComponents.find(comp => comp.types.includes('premise'))?.longText || '';
          // let administrative_area_level_3 = addressComponents.find(comp => comp.types.includes('administrative_area_level_3'))?.longText || '';
          // let sublocality_level_2 = addressComponents.find(comp => comp.types.includes('sublocality_level_2'))?.longText || '';
          // let sublocality_level_1 = addressComponents.find(comp => comp.types.includes('sublocality_level_1'))?.longText || '';
          // let locality = addressComponents.find(comp => comp.types.includes('locality'))?.longText || '';
          // let administrative_area_level_2 = addressComponents.find(comp => comp.types.includes('administrative_area_level_2'))?.longText || '';
          let administrative_area_level_1 = addressComponents.find(comp => comp.types.includes('administrative_area_level_1'))?.longText || '';
          let country = addressComponents.find(comp => comp.types.includes('country'))?.longText || '';
          let displayName = response.data.displayName?.text;
          const lat = response.data.location.latitude;
          const lng = response.data.location.longitude;
          
          this.selectedLocation = {
            pincode: pincode,
            addresss: street_number + ' ' + displayName + ', ' + administrative_area_level_1 + ', ' + country,
            formatted_address: response.data.formattedAddress || street_number + ' ' + displayName + ', ' + administrative_area_level_1 + ', ' + country,
            latitude: response.data.location.latitude,
            longitude: response.data.location.longitude,
            name: displayName
          };

          if (this.map) {
            this.map.setCenter({ lat, lng });
          }

          this.cdr.detectChanges();
        }
      },
      error: (error) => {
        console.error('Place details error:', error);
      }
    });
  }

  // Get address from coordinates via API
  getAddressFromCoordinates(latitude: number, longitude: number): void {
    this.addressService.getAddressFromCoordinates(latitude, longitude).subscribe({
      next: (response: any) => {
        if (response.responseCode == 200 && response.data) {
          // let addressComponents:any[] = response.data.results[0].address_components;
          // let pincode = addressComponents.find(comp => comp.types.includes('postal_code'))?.long_name || '';
          // let street_number = addressComponents.find(comp => comp.types.includes('street_number'))?.long_name || '';
          // let route = addressComponents.find(comp => comp.types.includes('route'))?.long_name || '';
          // let sublocality_level_2 = addressComponents.find(comp => comp.types.includes('sublocality_level_2'))?.long_name || '';
          // let sublocality_level_1 = addressComponents.find(comp => comp.types.includes('sublocality_level_1'))?.long_name || '';
          // let locality = addressComponents.find(comp => comp.types.includes('locality'))?.long_name || '';
          // let administrative_area_level_2 = addressComponents.find(comp => comp.types.includes('administrative_area_level_2'))?.long_name || '';
          // let administrative_area_level_1 = addressComponents.find(comp => comp.types.includes('administrative_area_level_1'))?.long_name || '';
          // let country = addressComponents.find(comp => comp.types.includes('country'))?.long_name || '';
          // this.selectedLocation = {
          //   pincode: pincode,
          //   addresss: street_number + ' ' + route + ', ' + sublocality_level_2 + ', ' + sublocality_level_1 + ', ' + locality + ', ' + administrative_area_level_2 + ', ' + administrative_area_level_1 + ', ' + country,
          //   formatted_address: response.data.results[0].formatted_address,
          //   latitude: response.data.results[0].geometry.location.lat,
          //   longitude: response.data.results[0].geometry.location.lng,
          //   name: sublocality_level_2
          // };

          this.selectedLocation = {
            pincode: response.data.pinCode,
            addresss: response.data.address,
            formatted_address: response.data.address,
            latitude: response.data.lat,
            longitude: response.data.lng,
            name: response.data.addressName
          };


          this.cdr.detectChanges();
        }
      },
      error: (error) => {
        console.error('Reverse geocode error:', error);
      }
    });
  }

  placeMarkerByCoordinates(lat: number, lng: number): void {
    const location = new google.maps.LatLng(lat, lng);
    this.placeMarker(location);
  }

  placeMarker(location: any): void {
    if (this.marker) {
      this.marker.setPosition(location);
    }
    
    // const lat = location.lat instanceof Function ? location.lat() : location.lat;
    // const lng = location.lng instanceof Function ? location.lng() : location.lng;
    
    // this.getAddressFromCoordinates(lat, lng);
    
    if (this.map) {
      this.map.setCenter(location);
    }
  }

  confirmLocation(): void {
    if (this.selectedLocation) {
      this.locationSelected.emit(this.selectedLocation);
      this.closeDialog();
    } else {
      alert('Please select a location');
    }
  }

  closeDialog(): void {
    this.isOpen = false;
    this.predictions = [];
    this.searchInput = '';
    this.closed.emit();
  }
}