import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnInit,
  Output,
  SimpleChanges,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import {
  Product,
  CreateProductDto,
  UpdateProductDto,
} from '../models/product.model';

@Component({
  selector: 'app-product-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './product-form.component.html',
  styleUrls: ['./product-form.component.scss'],
})
export class ProductFormComponent implements OnInit, OnChanges {
  @Input() product: Product | null = null;
  @Output() formSubmit = new EventEmitter<
    CreateProductDto | UpdateProductDto
  >();
  @Output() formCancel = new EventEmitter<void>();

  productForm!: FormGroup;
  isSubmitting = false;

  // Define categories for the dropdown
  categories = [
    'Electronics',
    'Clothing',
    'Home & Kitchen',
    'Books',
    'Toys',
    'Sports',
    'Beauty',
    'Health',
    'Automotive',
    'Other',
  ];

  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
    this.initForm();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['product'] && this.productForm) {
      this.updateForm();
    }
  }

  initForm(): void {
    this.productForm = this.fb.group({
      name: ['', [Validators.required]],
      description: ['', [Validators.required]],
      price: [0, [Validators.required, Validators.min(0)]],
      quantity: [0, [Validators.required, Validators.min(0)]],
      category: ['', [Validators.required]],
    });

    this.updateForm();
  }

  updateForm(): void {
    if (this.product) {
      this.productForm.patchValue({
        name: this.product.name,
        description: this.product.description,
        price: this.product.price,
        quantity: this.product.quantity,
        category: this.product.category,
      });
    }
  }

  onSubmit(): void {
    if (this.productForm.invalid) {
      return;
    }

    this.isSubmitting = true;
    const formData = this.productForm.value;
    this.formSubmit.emit(formData);
  }

  onCancel(): void {
    this.formCancel.emit();
  }

  // Getters for form controls to simplify access in the template
  get name() {
    return this.productForm.get('name');
  }
  get description() {
    return this.productForm.get('description');
  }
  get price() {
    return this.productForm.get('price');
  }
  get quantity() {
    return this.productForm.get('quantity');
  }
  get category() {
    return this.productForm.get('category');
  }
}
