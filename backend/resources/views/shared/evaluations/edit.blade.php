@php ($role = auth()->user()->role->value)
@php ($evaluation = $studentOjt->evaluation)
@extends ("layouts.app")
@section ("title", $evaluation ? "Edit Evaluation" : "Create Evaluation")
@section ("header_title", $evaluation ? "Edit Evaluation" : "Create Evaluation")
@section ("header_description",
  "Rate " .
    ($studentOjt->student?->full_name ?? "the trainee") .
    " using the 100-point supervisor assessment.")
@section ("content")
  <form
    method="POST"
    action="{{ route("web.{$role}.evaluations." . ($evaluation ? 'update' : 'store'), $studentOjt) }}"
    class="max-w-3xl space-y-4"
  >
    @csrf
    @if ($evaluation)
      @method ("PUT")
    @endif
    <div class="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
      <div class="grid gap-5 sm:grid-cols-2">
        @foreach ([
            [
              "quality",
              "Quality",
              40,
              "Overall performance on the trainee, his/her output in every task assigned to him/her. This involves his/her knowledge on the application he/she used in the processing of an inputs as well as its neatness and orderliness."
            ],
            ["productivity", "Productivity", 20, "Volume of useful work completed."],
            ["initiative", "Initiative", 20, "Willingness to learn and contribute."],
            [
              "time_management_punctuality",
              "Time Management / Punctuality",
              10,
              "Dependability and effective use of time."
            ],
            [
              "proper_attire_grooming",
              "Proper Attire / Grooming",
              10,
              "Professional workplace appearance."
            ]
          ]
          as [$field, $label, $max, $description])
          <div>
            <label for="{{ $field }}" class="block text-sm font-medium text-gray-700"
              >{{ $label }} <span class="text-gray-500">(max {{ $max }})</span></label
            >
            <p class="mb-1 text-xs text-gray-500">{{ $description }}</p>
            <input
              id="{{ $field }}"
              name="{{ $field }}"
              type="number"
              min="0"
              max="{{ $max }}"
              required
              value="{{ old($field, $evaluation?->{$field} ?? 0) }}"
              class="focus:border-primary-500 focus:ring-primary-500 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
            />
            @error ($field)
              <p class="mt-1 text-xs text-red-600">{{ $message }}</p>
            @enderror
          </div>
        @endforeach
      </div>
      <div class="mt-5">
        <label for="remarks" class="block text-sm font-medium text-gray-700"
          >Remarks (optional)</label
        ><textarea
          id="remarks"
          name="remarks"
          rows="4"
          class="focus:border-primary-500 focus:ring-primary-500 mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
          >{{
            old(
              "remarks",
              $evaluation?->remarks,
            )
          }}</textarea
        >
      </div>
      <div class="mt-5">
        <label for="status" class="block text-sm font-medium text-gray-700">Status</label
        ><select
          id="status"
          name="status"
          class="focus:border-primary-500 focus:ring-primary-500 mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
        >
          <option
            value="draft"
            @selected (old("status", $evaluation?->status?->value ?? "draft") === "draft")
          >
            Draft
          </option>
          <option
            value="submitted"
            @selected (old("status", $evaluation?->status?->value ?? "draft") === "submitted")
          >
            Submitted
          </option>
          <option
            value="finalized"
            @selected (old("status", $evaluation?->status?->value ?? "draft") === "finalized")
          >
            Finalized
          </option>
        </select>
      </div>
    </div>
    <div class="flex justify-end gap-2">
      <a
        href="{{ route("web.{$role}.evaluations.show", $studentOjt) }}"
        class="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >Cancel</a
      ><button
        type="submit"
        class="bg-primary-600 hover:bg-primary-700 rounded-md px-4 py-2 text-sm font-medium text-white"
      >
        Save Evaluation
      </button>
    </div>
  </form>
@endsection
